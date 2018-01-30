/**
 * Rank Filters Test
 *
 * @author Jean-Christophe Taveau
 */
 
// Create an Image containing boats (from ImageJ))



let img1 = new T.Image('uint8',360,288);
img1.setPixels(new Uint16Array(boats_pixels));

let img2 = new T.Image('uint16',360,288);
let uint16_boats = boats_pixels.map ( (px) => px * 256);
img2.setPixels(new Uint16Array(uint16_boats));



// Run CPU mean 5x5 
let size = 3;
let radius = size / 2.0 - 0.5;
let kernel5x5 = cpu.convolutionKernel(
  cpu.CPU_HARDWARE,                            // For cpu.convolve
  cpu.KERNEL_CIRCLE,                           // Circular kernel
  size,                                        // Circle contained in a squared kernel 5 x 5
  radius,                                      // Radius
  Array.from({length: size * size}).fill(1.0)  // Weights 1 for every cells (unused for rank filters but mandatory for creating kernel)
);
console.log("kernel : ",kernel5x5);

console.time('border_repeat');
let workflow1 = cpu.pipe(medianFilter(kernel5x5, cpu.BORDER_REPEAT), cpu.view);
console.timeEnd('border_repeat');
let view1 = workflow1(img1.getRaster());
// Create the window content from the view
let win1 = new T.Window(`Variance ${size}x${size} - Radius ${radius}`);
win1.addView(view1);
// Add the window to the DOM and display it
win1.addToDOM('workspace');

//cpu.convole(img1.getRaster(),gpuEnv);
