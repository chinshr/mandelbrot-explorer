export const vertexShader = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

export const fragmentShader = `
precision highp float;

uniform vec2 resolution;
uniform vec2 offset;
uniform float zoom;
uniform int maxIterations;

vec2 complexSquare(vec2 z) {
    return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
    vec2 c = uv * 4.0 / zoom + offset;
    
    vec2 z = vec2(0.0);
    int i = 0;
    
    // Early escape check for points definitely outside the set
    // Points outside the circle |c| > 2 always escape
    float cMagnitude = dot(c, c);
    if (cMagnitude > 4.0) {
        i = 0;
    } else {
        // Main cardioid check: points in the main bulb are always in the set
        float q = (c.x - 0.25) * (c.x - 0.25) + c.y * c.y;
        if (q * (q + (c.x - 0.25)) < 0.25 * c.y * c.y) {
            i = maxIterations - 1;
        }
        // Period-2 bulb check
        else if ((c.x + 1.0) * (c.x + 1.0) + c.y * c.y < 0.0625) {
            i = maxIterations - 1;
        }
        else {
            for(int iter = 0; iter < 1000; iter++) {
                if(iter >= maxIterations) break;
                
                z = complexSquare(z) + c;
                
                float zMagnitude = dot(z, z);
                if(zMagnitude > 4.0) { // Reduced from 24.0 since |z| > 2 guarantees escape
                    break;
                }
                i = iter;
            }
        }
    }
    
    if(i == maxIterations - 1) {
        // Points inside the set are bright and colorful
        float hue = length(z) * 0.1; // Use the final z value to create varying colors
        float sat = 0.8;  // High saturation for vibrant colors
        float val = 0.9;  // High value for brightness
        vec3 rgb = hsv2rgb(vec3(hue, sat, val));
        gl_FragColor = vec4(rgb, 1.0);
    } else {
        // Points outside the set are darker
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
`; 