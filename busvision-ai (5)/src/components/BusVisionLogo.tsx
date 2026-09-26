interface BusVisionLogoProps {
  className?: string;
  color?: string;
}

export default function BusVisionLogo({ 
  className = "w-10 h-10", 
  color = "#084C6F" 
}: BusVisionLogoProps) {
  return (
    <svg 
      viewBox="0 0 500 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill={color}>
        {/* Main roofline, windshield top, and right A-pillar down to mirror */}
        <path d="M 120 178 C 165 150 215 118 245 105 C 275 92 335 105 372 130 C 390 142 396 156 392 178 C 388 190 378 198 374 206 C 370 212 372 238 372 242 L 392 242 C 393 230 395 206 395 194 C 395 168 390 142 370 122 C 335 92 270 82 235 100 C 200 116 148 152 120 178 Z" />

        {/* Right side mirror block */}
        <path d="M 372 205 C 370 210 370 238 370 242 C 370 244 392 244 392 242 C 392 218 392 198 385 194 C 380 190 374 198 372 205 Z" />

        {/* Left inner side mirror */}
        <path d="M 252 148 C 256 156 278 172 280 188 L 280 224 L 256 224 L 256 184 C 256 168 248 156 252 148 Z" />

        {/* Windshield left A-pillar */}
        <path d="M 238 116 C 246 122 258 132 258 144 L 262 305 L 252 305 L 246 148 C 243 140 237 132 233 124 L 238 116 Z" />

        {/* Upper aerodynamic speed swoop */}
        <path d="M 170 185 C 195 170 220 150 234 134 L 224 142 C 198 174 165 202 178 242 C 186 266 206 286 230 298 C 218 286 202 266 198 242 C 192 210 178 193 170 185 Z" />

        {/* Lower dynamic speed swoops on the rear body */}
        <path d="M 142 258 C 164 258 194 246 215 230 C 198 246 168 260 142 258 Z" />
        <path d="M 142 256 C 168 256 206 238 232 298 C 218 282 188 258 142 256 Z" />

        {/* Front bumper upper line & headlights grille */}
        <path d="M 244 294 C 284 302 344 302 384 282 C 388 286 388 314 386 350 C 382 360 374 362 360 362 C 318 366 276 354 242 346 C 244 342 246 330 248 318 C 284 326 344 326 378 310 L 376 298 C 336 310 284 310 246 302 L 244 294 Z" />

        {/* Front bottom chin spoiler */}
        <path d="M 242 350 C 276 360 326 364 382 342 C 380 350 374 358 360 360 C 310 366 268 358 242 350 Z" />

        {/* Center lower intake bar */}
        <path d="M 288 314 L 360 314 C 360 326 344 334 324 334 C 304 334 288 326 288 314 Z" />
      </g>
    </svg>
  );
}
