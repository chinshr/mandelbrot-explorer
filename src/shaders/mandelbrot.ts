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
uniform vec2 mousePos;  // Mouse position in normalized coordinates (-1 to 1)

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
    
    // Calculate the point in complex space centered around the offset
    vec2 c = offset + uv * 4.0 / zoom;
    
    vec2 z = vec2(0.0);
    int i = 0;
    
    // Main iteration loop for the Mandelbrot set
    for(int iter = 0; iter < 1000; iter++) {
        if(iter >= maxIterations) break;
        
        z = complexSquare(z) + c;
        
        if(dot(z, z) > 4.0) {
            break;
        }
        
        i = iter;
    }
    
    if(i == maxIterations - 1) {
        // Points inside the set are black
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // Points outside the set have a smooth color gradient
        float t = float(i) / float(maxIterations);
        vec3 color = hsv2rgb(vec3(0.5 + 0.5 * sin(t * 3.0), 0.8, 0.8));
        gl_FragColor = vec4(color, 1.0);
    }
}
`; 