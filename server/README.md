# Jemea Hub Backend Server

Express.js backend for handling Cloudinary image uploads.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Cloudinary credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
CLOUDINARY_CLOUD_NAME=HUMSJ_acadamic_Sec
CLOUDINARY_API_KEY=553854382693153
CLOUDINARY_API_SECRET=hZ5rFMPVkIUAT_lsv0hl8V3CwUU
```

### 3. Start Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### 4. Test

Server should be running at: `http://localhost:5000`

Test health endpoint:
```bash
curl http://localhost:5000/health
```

## API Endpoints

- `POST /api/upload` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images (max 10)
- `DELETE /api/upload/:publicId` - Delete image
- `GET /health` - Health check

## Project Structure

```
server/
├── config/
│   └── cloudinary.js      # Cloudinary SDK configuration
├── middleware/
│   └── upload.js          # Multer file upload middleware
├── routes/
│   └── uploadRoute.js     # Upload API routes
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── package.json           # Dependencies
├── server.js              # Express server entry point
└── README.md              # This file
```

## Dependencies

- **express** - Web framework
- **multer** - File upload handling
- **cloudinary** - Cloudinary SDK
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Development

The server uses `nodemon` for development, which automatically restarts when files change.

```bash
npm run dev
```

## Testing Upload

Using curl:
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "image=@/path/to/your/image.jpg"
```

Using Postman:
1. Set method to POST
2. URL: `http://localhost:5000/api/upload`
3. Body → form-data
4. Key: `image` (type: File)
5. Value: Select your image file

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Required |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Required |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## Security Notes

- Never commit `.env` file to version control
- API credentials are only used server-side
- File size limited to 5MB (configurable in `middleware/upload.js`)
- Only image files are accepted
- CORS is configured to only allow requests from `FRONTEND_URL`

## Troubleshooting

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in .env
PORT=5001
```

**Cloudinary errors:**
- Verify credentials in `.env`
- Check Cloudinary dashboard for quota limits
- Ensure cloud name doesn't have spaces

**CORS errors:**
- Verify `FRONTEND_URL` matches your frontend
- Check browser console for specific error

## License

ISC
