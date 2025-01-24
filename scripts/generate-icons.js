const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const SIZES = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'icon-192x192.png': 192,
    'icon-384x384.png': 384,
    'icon-512x512.png': 512,
    'og-image.png': 1200,
};

async function generateIcons() {
    try {
        const svgBuffer = await fs.readFile(path.join(__dirname, '../public/logo.svg'));

        // Generate all PNG icons
        for (const [filename, size] of Object.entries(SIZES)) {
            let width = size;
            let height = size;

            // Special case for OG image
            if (filename === 'og-image.png') {
                height = 630; // Facebook recommended OG image size is 1200x630
            }

            console.log(`Generating ${filename}...`);
            await sharp(svgBuffer)
                .resize(width, height, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .png()
                .toFile(path.join(__dirname, '../public', filename));
        }

        // For favicon.ico, we'll use the 32x32 PNG we just generated
        console.log('Generating favicon.ico...');
        const favicon32Buffer = await fs.readFile(path.join(__dirname, '../public/favicon-32x32.png'));
        await sharp(favicon32Buffer)
            .resize(32, 32)
            .png()
            .toFile(path.join(__dirname, '../public/favicon.ico'));

        console.log('✅ All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons(); 