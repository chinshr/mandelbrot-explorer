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
    
    for(int iter = 0; iter < 1000; iter++) {
        if(iter >= maxIterations) break;
        
        // Iterate z = z² + c and check if the point escapes (magnitude > 2)
        // If it doesn't escape within maxIterations, it's considered part of the Mandelbrot set
        z = complexSquare(z) + c;
        
        if(dot(z, z) > 4.0) {
            break;
        }
        i = iter;
    }
    
    if(i == maxIterations - 1) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        float hue = float(i) / float(maxIterations);
        float sat = 0.6;
        float val = 1.0;
        if(i == maxIterations - 1) val = 0.0;
        
        vec3 rgb = hsv2rgb(vec3(hue, sat, val));
        gl_FragColor = vec4(rgb, 1.0);
    }
}
`; 