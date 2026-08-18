const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync('index.html', 'utf8');
const cssContent = fs.readFileSync('styles.css', 'utf8');
const jsContent = fs.readFileSync('script.js', 'utf8');

const imagePath = '../../brain/f43b3f62-8042-4744-b007-6bbbcc98af48/normal_proportion_robot_1784448004749.png';
const imageBuffer = fs.readFileSync(imagePath);
const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

// Replace image src
let newHtml = htmlContent.replace(
    'src="../../brain/f43b3f62-8042-4744-b007-6bbbcc98af48/normal_proportion_robot_1784448004749.png"',
    `src="${imageBase64}"`
);

// Replace CSS link with inline styles
newHtml = newHtml.replace(
    /<link\s+rel="stylesheet"\s+href="styles\.css[^"]*">/i,
    `<style>\n${cssContent}\n</style>`
);

// Replace JS script with inline script
newHtml = newHtml.replace(
    /<script\s+src="script\.js[^"]*"><\/script>/i,
    `<script>\n${jsContent}\n</script>`
);

fs.writeFileSync('운동_처방전_학생용.html', newHtml, 'utf8');
console.log('Successfully created 운동_처방전_학생용.html');
