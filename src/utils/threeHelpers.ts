
import * as THREE from 'three';

/**
 * Creates a sprite with text content
 */
export function createTextSprite(
    message: string,
    parameters: {
        fontface?: string;
        fontsize?: number;
        borderThickness?: number;
        borderColor?: { r: number; g: number; b: number; a: number };
        backgroundColor?: { r: number; g: number; b: number; a: number };
        textColor?: string;
    } = {}
): THREE.Sprite {
    const fontface = parameters.fontface || 'Arial';
    const fontsize = parameters.fontsize || 24;
    const borderThickness = parameters.borderThickness || 0;

    const backgroundColor = parameters.backgroundColor || { r: 255, g: 255, b: 255, a: 1.0 };
    const textColor = parameters.textColor || 'rgba(0, 0, 0, 1.0)';

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create canvas context');

    // Set canvas size
    canvas.width = 512;
    canvas.height = 256;

    context.font = `Bold ${fontsize}px ${fontface}`;

    // Get text metrics
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    // Background
    if (parameters.backgroundColor) {
        context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
        context.fillRect(
            canvas.width / 2 - textWidth / 2 - borderThickness,
            canvas.height / 2 - fontsize / 2 - borderThickness,
            textWidth + borderThickness * 2,
            fontsize * 1.4 + borderThickness * 2
        );
    }

    // Text
    context.fillStyle = textColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Scale sprite
    const scale = 5;
    sprite.scale.set(scale * 2, scale, 1);

    return sprite;
}
