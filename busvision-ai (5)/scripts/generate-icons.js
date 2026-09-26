import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const publicDir = path.resolve('public');
  
  // Standard SVG with blue bus on transparent
  const blueSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="400" height="333">
    <g fill="#084C6F">
      <path d="M 140 220 C 180 195 240 150 280 130 C 320 110 390 125 435 155 C 455 170 460 185 455 210 C 452 225 440 235 435 245 C 430 252 432 285 432 290 L 452 290 C 453 275 455 245 455 230 C 455 200 450 170 425 145 C 385 110 310 100 270 120 C 230 140 170 185 140 220 Z" />
      <path d="M 432 245 C 430 250 430 285 430 290 C 430 292 455 292 455 290 C 455 260 455 235 448 230 C 442 225 435 235 432 245 Z" />
      <path d="M 285 185 C 290 195 320 215 322 235 L 322 278 L 294 278 L 294 230 C 294 210 280 195 285 185 Z" />
      <path d="M 276 142 C 285 148 300 160 300 175 L 305 380 L 294 380 L 285 180 C 282 170 275 160 270 152 L 276 142 Z" />
      <path d="M 195 228 C 225 210 255 185 272 165 L 260 175 C 230 215 190 250 205 300 C 215 330 240 355 270 370 C 255 355 235 330 230 300 C 222 260 205 238 195 228 Z" />
      <path d="M 165 320 C 190 320 225 305 250 285 C 230 305 195 322 165 320 Z" />
      <path d="M 165 318 C 195 318 240 295 270 370 C 255 350 220 320 165 318 Z" />
      <path d="M 283 365 C 330 375 400 375 448 350 C 452 355 452 390 450 435 C 445 448 435 450 420 450 C 370 455 320 440 280 430 C 282 425 285 410 288 395 C 330 405 400 405 440 385 L 438 370 C 390 385 330 385 285 375 L 283 365 Z" />
      <path d="M 280 435 C 320 448 380 452 445 425 C 442 435 435 445 420 448 C 360 455 310 445 280 435 Z" />
      <path d="M 335 390 L 420 390 C 420 405 400 415 375 415 C 350 415 335 405 335 390 Z" />
    </g>
  </svg>`;

  // Maskable SVG with solid brand background and white bus icon centered in safe zone (80% diameter)
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" fill="#084C6F" />
    <g transform="translate(106, 126) scale(0.5)" fill="#FFFFFF">
      <path d="M 140 220 C 180 195 240 150 280 130 C 320 110 390 125 435 155 C 455 170 460 185 455 210 C 452 225 440 235 435 245 C 430 252 432 285 432 290 L 452 290 C 453 275 455 245 455 230 C 455 200 450 170 425 145 C 385 110 310 100 270 120 C 230 140 170 185 140 220 Z" />
      <path d="M 432 245 C 430 250 430 285 430 290 C 430 292 455 292 455 290 C 455 260 455 235 448 230 C 442 225 435 235 432 245 Z" />
      <path d="M 285 185 C 290 195 320 215 322 235 L 322 278 L 294 278 L 294 230 C 294 210 280 195 285 185 Z" />
      <path d="M 276 142 C 285 148 300 160 300 175 L 305 380 L 294 380 L 285 180 C 282 170 275 160 270 152 L 276 142 Z" />
      <path d="M 195 228 C 225 210 255 185 272 165 L 260 175 C 230 215 190 250 205 300 C 215 330 240 355 270 370 C 255 355 235 330 230 300 C 222 260 205 238 195 228 Z" />
      <path d="M 165 320 C 190 320 225 305 250 285 C 230 305 195 322 165 320 Z" />
      <path d="M 165 318 C 195 318 240 295 270 370 C 255 350 220 320 165 318 Z" />
      <path d="M 283 365 C 330 375 400 375 448 350 C 452 355 452 390 450 435 C 445 448 435 450 420 450 C 370 455 320 440 280 430 C 282 425 285 410 288 395 C 330 405 400 405 440 385 L 438 370 C 390 385 330 385 285 375 L 283 365 Z" />
      <path d="M 280 435 C 320 448 380 452 445 425 C 442 435 435 445 420 448 C 360 455 310 445 280 435 Z" />
      <path d="M 335 390 L 420 390 C 420 405 400 415 375 415 C 350 415 335 405 335 390 Z" />
    </g>
  </svg>`;

  // 1. Generate 192x192 PNG (White background with blue icon)
  await sharp(Buffer.from(blueSvg))
    .resize(150, 125, { fit: 'contain' })
    .extend({
      top: 33,
      bottom: 34,
      left: 21,
      right: 21,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 2. Generate 512x512 PNG (White background with blue icon)
  await sharp(Buffer.from(blueSvg))
    .resize(400, 333, { fit: 'contain' })
    .extend({
      top: 89,
      bottom: 90,
      left: 56,
      right: 56,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 3. Generate 512x512 maskable PNG (Deep brand blue background with safe zone margins)
  await sharp(Buffer.from(maskableSvg))
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 4. Generate 180x180 apple-touch-icon PNG
  await sharp(Buffer.from(maskableSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('PWA icons successfully generated in /public!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
