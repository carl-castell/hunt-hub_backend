import { Request, Response } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { areasTable } from '@/db/schema/areas';
import { standsTable } from '@/db/schema/stands';
import { z } from 'zod';
import toGeoJSON from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import * as shapefile from 'shapefile';

const execAsync = promisify(exec);

const areaNameSchema = z.object({
  name: z.string().min(1).max(255),
});

const deleteConfirmSchema = z.object({
  confirm: z.string(),
});

// ── Normalise any GeoJSON to a bare GeometryCollection ────────────────────────

function toGeometryCollection(geojson: string): string {
  const parsed = JSON.parse(geojson);

  if (parsed.type === 'FeatureCollection') {
    return JSON.stringify({
      type: 'GeometryCollection',
      geometries: parsed.features.map((f: any) => f.geometry).filter(Boolean),
    });
  }

  if (parsed.type === 'Feature') {
    return JSON.stringify({
      type: 'GeometryCollection',
      geometries: [parsed.geometry].filter(Boolean),
    });
  }

  // Already a bare geometry — wrap it for consistency
  if (parsed.type !== 'GeometryCollection') {
    return JSON.stringify({
      type: 'GeometryCollection',
      geometries: [parsed],
    });
  }

  return geojson;
}

// ── Get Area ─────────────────────────────────────────────────────────────────

export async function getArea(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [area] = await db
      .select({
        id: areasTable.id,
        name: areasTable.name,
        estateId: areasTable.estateId,
        geofile: sql<string>`ST_AsGeoJSON(geofile)`,
      })
      .from(areasTable)
      .where(eq(areasTable.id, Number(id)))
      .limit(1);

    if (!area || area.estateId !== user.estateId) return res.status(404).send('Area not found');

    const breadcrumbs = [
      { label: 'Estate', href: '/manager/estate' },
      { label: area.name },
    ];
    res.render('manager/estate/area', { title: area.name, user, area, breadcrumbs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

// ── Create Area ───────────────────────────────────────────────────────────────

export async function postCreateArea(req: Request, res: Response) {
  try {
    const user = req.session.user!;

    const result = areaNameSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.issues[0].message);

    const [area] = await db
      .insert(areasTable)
      .values({ name: result.data.name, estateId: user.estateId! })
      .returning();

    res.redirect(`/manager/areas/${area.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

// ── Rename Area ───────────────────────────────────────────────────────────────

export async function postRenameArea(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [area] = await db
      .select({
        id: areasTable.id,
        name: areasTable.name,
        estateId: areasTable.estateId,
      })
      .from(areasTable)
      .where(eq(areasTable.id, Number(id)))
      .limit(1);

    if (!area || area.estateId !== user.estateId) return res.status(404).send('Area not found');

    const result = areaNameSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.issues[0].message);

    await db
      .update(areasTable)
      .set({ name: result.data.name })
      .where(eq(areasTable.id, Number(id)));

    res.redirect(`/manager/areas/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

// ── Delete Area ───────────────────────────────────────────────────────────────

export async function postDeleteArea(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [area] = await db
      .select({
        id: areasTable.id,
        name: areasTable.name,
        estateId: areasTable.estateId,
      })
      .from(areasTable)
      .where(eq(areasTable.id, Number(id)))
      .limit(1);

    if (!area || area.estateId !== user.estateId) return res.status(404).send('Area not found');

    const result = deleteConfirmSchema.safeParse(req.body);
    if (!result.success || result.data.confirm !== area.name) {
      return res.status(400).send('Confirmation name does not match.');
    }

    await db.delete(standsTable).where(eq(standsTable.areaId, Number(id)));
    await db.delete(areasTable).where(eq(areasTable.id, Number(id)));

    res.redirect('/manager/estate');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

// ── Upload / Replace Geo File ─────────────────────────────────────────────────

export async function postUploadGeofile(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [area] = await db
      .select({
        id: areasTable.id,
        name: areasTable.name,
        estateId: areasTable.estateId,
      })
      .from(areasTable)
      .where(eq(areasTable.id, Number(id)))
      .limit(1);

    if (!area || area.estateId !== user.estateId) return res.status(404).send('Area not found');
    if (!req.file) return res.status(400).send('No file uploaded');

    const filename = req.file.originalname.toLowerCase();
    const content = req.file.buffer.toString('utf-8');
    let geojson: string;

    // ── GeoJSON ───────────────────────────────────────────────────────────────
    if (filename.endsWith('.geojson') || filename.endsWith('.json')) {
      JSON.parse(content); // validate
      geojson = content;

    // ── KML ───────────────────────────────────────────────────────────────────
    } else if (filename.endsWith('.kml')) {
      const dom = new DOMParser().parseFromString(content, 'text/xml' as any);
      geojson = JSON.stringify(toGeoJSON.kml(dom));

    // ── GPX ───────────────────────────────────────────────────────────────────
    } else if (filename.endsWith('.gpx')) {
      const dom = new DOMParser().parseFromString(content, 'text/xml' as any);
      geojson = JSON.stringify(toGeoJSON.gpx(dom));

    // ── Shapefile (.zip containing .shp + .dbf) ───────────────────────────────
    } else if (filename.endsWith('.zip')) {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shp-'));
      const zipPath = path.join(tmpDir, 'upload.zip');
      await fs.writeFile(zipPath, req.file.buffer);

      await execAsync(`unzip -o "${zipPath}" -d "${tmpDir}"`);

      const files = await fs.readdir(tmpDir);
      const shpFile = files.find(f => f.endsWith('.shp'));
      if (!shpFile) {
        await fs.rm(tmpDir, { recursive: true });
        return res.status(400).send('ZIP does not contain a .shp file');
      }

      const shpPath = path.join(tmpDir, shpFile);
      const dbfPath = shpPath.replace('.shp', '.dbf');

      const features: any[] = [];
      const source = await shapefile.open(shpPath, dbfPath);
      let result = await source.read();
      while (!result.done) {
        features.push(result.value);
        result = await source.read();
      }

      geojson = JSON.stringify({ type: 'FeatureCollection', features });
      await fs.rm(tmpDir, { recursive: true });

    // ── GeoPackage (.gpkg) ────────────────────────────────────────────────────
    } else if (filename.endsWith('.gpkg')) {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gpkg-'));
      const gpkgPath = path.join(tmpDir, 'upload.gpkg');
      await fs.writeFile(gpkgPath, req.file.buffer);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let gdal: any;
      try {
        gdal = (await import('gdal-async')).default;
      } catch {
        await fs.rm(tmpDir, { recursive: true });
        return res.status(400).send('GeoPackage (.gpkg) is not supported on this server. Use .geojson, .kml, .gpx, or .zip instead.');
      }

      const ds = await gdal.openAsync(gpkgPath);
      const features: any[] = [];

      for (const layer of ds.layers) {
        for (const feature of layer.features) {
          const geom = feature.getGeometry();
          if (!geom) continue;
          features.push({
            type: 'Feature',
            geometry: JSON.parse(geom.toJSON()),
            properties: feature.fields.toObject()
          });
        }
      }

      geojson = JSON.stringify({ type: 'FeatureCollection', features });
      ds.close();
      await fs.rm(tmpDir, { recursive: true });

    } else {
      return res.status(400).send('Unsupported file type. Use .geojson, .kml, .gpx, .zip (shapefile), or .gpkg');
    }

    const geometryCollection = toGeometryCollection(geojson);

    await db
      .update(areasTable)
      .set({ geofile: sql`ST_GeomFromGeoJSON(${geometryCollection})` })
      .where(eq(areasTable.id, Number(id)));

    res.redirect(`/manager/areas/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

// ── Delete Geo File ───────────────────────────────────────────────────────────

export async function postDeleteGeofile(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [area] = await db
      .select({
        id: areasTable.id,
        name: areasTable.name,
        estateId: areasTable.estateId,
      })
      .from(areasTable)
      .where(eq(areasTable.id, Number(id)))
      .limit(1);

    if (!area || area.estateId !== user.estateId) return res.status(404).send('Area not found');

    await db
      .update(areasTable)
      .set({ geofile: null })
      .where(eq(areasTable.id, Number(id)));

    res.redirect(`/manager/areas/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
