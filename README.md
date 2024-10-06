# In Construction


# Architecture

```mermaid
flowchart LR
    subgraph Frontend
        Login_Form

    end

    subgraph Backend
        invitation
        session
        
    end

    subgraph Database
        Pull_user_Credentials
    
    end

    subgraph Mailgun
        mailgun-api
    end

    invitation --> mailgun-api
     



```