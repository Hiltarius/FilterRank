"use strict";
///////////Variance_filter////////////
/**
 * Display uint8 images
 */

//let img0 = new T.Image('uint8',360,288);
let img0 = new T.Image('uint8',256,254);
//img0.setPixels(boats_pixels);
img0.setPixels(blobs_pixels);
let win0 = new T.Window('Blobs 8 bit');
let view0 = T.view(img0.getRaster());
win0.addView(view0);
win0.addToDOM('workspace');


//let img1 = new T.Image('uint8',360,288);
let img1 = new T.Image('uint8',256,254);
let win1 = new T.Window('Blobs 8bit');
let view1 = T.view(img1.getRaster());

let kernel_size=2;
let ImgI = variance(img0,kernel_size);

//console.log(ImgI);
let img2 = new T.Image('uint8',256,254);
img2.setPixels(ImgI);
let win2 = new T.Window('Blob 8bit');
let view2 = T.view(img2.getRaster());
win2.addView(view2);
win2.addToDOM('workspace');
//let img2 = new T.Image('uint8',360,288);

let img3 = new T.Image('uint8',256,254);
img3.setPixels(ImgI);
console.log("ok");
console.log(img2.width);
let process = T.pipe(T.crop(1,1,img3.width - kernel_size,img3.height - kernel_size),T.view);
let view3 = process(img3.getRaster());
//console.log(`${view3.width} x ${view3.height} `);
let win3 = new T.Window('Blobs crop uint8');
win3.addView(view3);
win3.addToDOM('workspace');

/**
 * Display uint16 images
 */

let img01 = new T.Image('uint16',256,254);
let uint16_blobs = blobs_pixels.map ( (px) => px * 256);
img01.setPixels(uint16_blobs);
let win01 = new T.Window('Blobs uint16');
let view01 = T.view(img01.getRaster());
// Create the window content from the view
win01.addView(view01);
// Add the window to the DOM and display it
win01.addToDOM('workspace');


let img02 = new T.Image('uint16',256,254);
let ImgII = variance(img01,kernel_size);
img02.setPixels(ImgII);
let win02 = new T.Window('Blobs uint16');
let view02 = T.view(img02.getRaster());
win02.addView(view02);
win02.addToDOM('workspace');

/**
 * Display float32 images
 */


let img002 = new T.Image('float32',256,254);
let float_blobs = blobs_pixels.map( (px) => px/128 - 1.0);
img002.setPixels(float_blobs);
let win002 = new T.Window('Blobs float32');
let view002 = T.view(img002.getRaster());
// Create the window content from the view
win002.addView(view002);
// Add the window to the DOM and display it
win002.addToDOM('workspace');



let img003 = new T.Image('float32',256,254);
let ImgIII = variance(img002,kernel_size);
img003.setPixels(ImgIII);
let win003 = new T.Window('Boats');
let view003 = T.view(img003.getRaster());
win003.addView(view003);
win003.addToDOM('workspace');








