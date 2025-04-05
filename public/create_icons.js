// Script to create icon files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base64 encoded PNG data for a simple red "DS" icon 
// (This is a small 16x16 PNG)
const base64Icon = `
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAABhklE
QVQ4y6WTzytEURTHP2/e/JoxYkbKbCQWFmKlJismWbCgLCyk/AWsBP+AjalZ2ShKsbCYhSQpNZQiP8av
kR9j3rivmfHeTONdnc65557POffccyMiQjMtVjJRPQA0gB0gAMwAXUAJOAOOgDLQAyiq9hVFUUiLt4AT
oAU4A5LA6Gf1OO/wlKi+SZrxDHDot96hGzvEbJ9/KfAdmKsGWCqqcJdBtJfW4Aj+tlF09RfcRQj2gcqL
OQsC9eW+JDgTRmEwOEmuUCBevKRYvid6uMT15TFnZ8fUZqFqU7UZeLsnaG5tpyedJpvJEI/HMQyDkufR
39/HaChEOpGgODJPyjAwUlEb4OkdJ5XKMDgwiK7r1eCrqysMw2BiYoLRUAhN0xgLhxkLh5kLrDqcaP+U
B1DXdQKBgKP5fB5FUXgvFAAsK03OC24Cj8CK3TyZTKJp2q9mpVIhu7eHqqp4PB67ZN3phPaAceAF2AYG
gBt7JpPJsJdOs7W5SSQScToRALd+4VsOZweP/pYLTWLlGyD1DRGgbm+DAzvnAAAAAElFTkSuQmCC
`;

// Function to create icons of different sizes
const createIcons = () => {
  // Remove any whitespace from the Base64 string
  const cleanBase64 = base64Icon.replace(/\s/g, '');
  
  // Convert Base64 to binary
  const iconData = Buffer.from(cleanBase64, 'base64');
  
  // Save the icon files
  fs.writeFileSync(path.join(__dirname, 'icon16.png'), iconData);
  fs.writeFileSync(path.join(__dirname, 'icon48.png'), iconData);
  fs.writeFileSync(path.join(__dirname, 'icon128.png'), iconData);
  
  console.log('Icon files created successfully!');
};

// Run the function
createIcons(); 