
# URL Shortener Service

A simple URL shortening service built for the GIVAI Software Engineering Internship assignment. It shortens URLs, redirects to originals, tracks usage, and supports custom aliases.

## Local Setup

### Prerequisites
- Node.js (v18+)
- Docker
- npm

# Install Docker and Docker Compose (If Not Present)
### Ubuntu/Linux

1. **Install Docker**
```bash
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg lsb-release
   sudo mkdir -p /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
   sudo docker run hello-world
```
2. **Install Docker Compose**
```bash
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  docker-compose --version
```
3. **Post Installation**
```bash
  sudo usermod -aG docker $USER && newgrp docker
  sudo systemctl enable docker.service
```

### Setup Steps
1. **Clone the Repo**
   ```bash
   git clone https://github.com/Adwait1609/url-shortner.git
   cd url-shortner
   ```
2. **Start Services**
   Ensure `docker-compose.yml` is in the root folder (with MongoDB and Redis configs).
   ```bash
   docker-compose up -d --build
   # Runs MongoDB (port 27017) and Redis (port 6379)
   ```

## Testing APIs

1. **Shorten a URL**
   ```bash
   curl -X POST http://localhost/api/shorten \
        -H "Content-Type: application/json" \
        -d '{"originalUrl": "https://google.com"}'
   ```
   **Response**:
   ```json
   {"shortCode": "aB9kP_", "shortUrl": "http://localhost:3000/aB9kP_"}
   ```

2. **Custom Alias**
   ```bash
   curl -X POST http://localhost/api/shorten \
        -H "Content-Type: application/json" \
        -d '{"originalUrl": "https://google.com", "alias": "mygoogle"}'
   ```
   **Response**:
   ```json
   {"shortCode": "mygoogle", "shortUrl": "http://localhost:3000/mygoogle"}
   ```

3. **Redirect**
   ```bash
   curl -v http://localhost/aB9kP_
   ```
   **Response**: `302`, `Location: https://google.com`
