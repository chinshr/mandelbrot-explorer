# Mandelbrot Explorer

## Installation

```
npm install
npm run dev
```

Start your browser at http://localhost:5173/

Examples: 

```
open -a "Google Chrome" http://localhost:5173/
# or
open -a Safari http://localhost:5173/
```

## Usage

1. Pan by dragging (press left-mouse-button + move mouse up/down/left/right) 
2. Zoom in/out using the mouse wheel

## Implementation

* Vite 
* React + TypeScript
* Three + Fibers

## How it works

1. Create a webpage that displays a colored 2D grid visualization of the following equation: $z_{n+1} = z_n^2 + c$
2. Where:
    - $z$ starts at 0 ($z_{0}$ = 0)
    - $c$ is a complex number representing each point on your grid
    - Each point c has the form ( $x + yi$ ) where $x$ is the horizontal position and $y$ is the vertical position
3. Visualization specifications:
    - Create a grid spanning from (-2,-2) to (2,2) in the complex plane
    - The horizontal axis represents the real component (x)
    - The vertical axis represents the imaginary component (y)
    - Each axis should have at least 500 segments (resulting in at least 250,000 grid squares)
    - Color each square based on whether the equation remains bounded or grows unbounded when iterated many times
        - LIGHT color: if the sequence remains bounded for that point
        - DARK color: if the sequence grows unbounded for that point
4. Technical approach:
    - You may use any frontend technologies you're comfortable with (HTML/CSS, Canvas, WebGL, etc.)
    - Implementation can be a single HTML file or use a framework of your choice
    - Performance optimization is encouraged given the large number of calculations

Example calculation for the point (1, 2):

- Start with $z_{0} = 0$
- $c = 1 + 2i$
- Calculate $z_1 = (0)^2 + (1 + 2i) = 1 + 2i ≈ 2.236$
- Calculate $z_2 = (1 + 2i)^2 + (1 + 2i) = -2 +6i ≈ 6.325$
- Calculate $z_{3} = (-2 + 6i)^2 + (1 + 2i) = -31 - 22i ≈ 38.013$
- Continue iterating to determine if this sequence grows unbounded (this one is unbounded so this square should be DARK).