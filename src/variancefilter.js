"use strict";
/*
 *  TIMES: Tiny Image ECMAScript Application
 *  Copyright (C) 2017  Jean-Christophe Taveau.
 *
 *  This file is part of TIMES
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,Image
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with TIMES.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Authors:
 * Jean-Christophe Taveau
 * 
 */

/**
 * @module rankFilters
 */


//const variance = function (img, kernel , copy_mode=true) {  
const variance = (kernel) => (img,copy_mode= true) => {    
    /**
     * Variance filter :  It will first compute the summed area table of 
     * all the pixels wihtin the first img and after compute the summed squared area 
     * table of all the pixels within the img2.
     * After this process the two img are then padded with 0 according to
     * the dimension of the convolution mask. 
     * Finally an algorithm based on Integral Image is applied to compute 
     * the variance.
     *
     * @param {TRaster} kernel - Convolution mask represented here by a defalt value = 2
       with this algorithm the kernel doesn't have to be squared.
     * @param {TRaster} img - Input image to process
     * @param {boolean} copy - Copy mode to manage memory usage
     * @return {TRaster} - Filtered Image
     *
     * @author Franck Soubès / Jean-Christophe Taveau 
     */

    let output = T.Raster.from(img,copy_mode);
    let w= output.width;
    let h = output.height;
    let wk = kernel;
    let pixels = img.pixelData ;
    let imgsquare =  pixels.map((x) => x * x );		
    let integral = [];
	
    img.pixelData.reduce((sum1,px,i) => {
	let x = i%w;
	sum1[x] += px;
	integral[i] = sum1[x] + ((x == 0 ) ? 0.0 : integral[i-1])
	return sum1;},new Float32Array(w).fill(0.0));

    
    let integral2 = [];
    imgsquare.reduce((sum1,px,i) => {
	let x = i%w;
	sum1[x] += px;
	integral2[i] = sum1[x] + ((x == 0 ) ? 0.0 : integral2[i-1])
	return sum1;},new Float32Array(w).fill(0.0));
	
    /* another method not totally functionnal but way more faster with the use of forEach
        let sum = 0;
    let arr= Array.from(Array(w), () => NaN);
    let width = arr.map((i,x) => x);
    let height = arr.map((j,y)=> y);
    
    let firstintegral = width.forEach(x =>{
	sum = 0;
	height.forEach(y =>{
	    sum += pixels[x + y*w];
	    (x==0) ? img_copy[x+y*w] = sum:img_copy[x+y*w] = img_copy[(x-1)+y*w] + sum;
	});
    });
    */

    let padd = padding(integral,wk,w,h,true);
    let padd2 = padding(integral2,wk,w,h,true);
    let filtered= Variancefilter(padd,padd2,img.type,w,h,wk, true);
    output.pixelData = filtered;
  
    return (output);
}


const padding = function(img,k,w,h,copy_mode = true){
    /**
     * Padding : Fill with 0 an image in function of the kernel diameter.
     *
     * @param {Array} img - Input image to process.
     * @param {Integer} k - Convolution mask represented by the kernel diameter (width)
     * @param {Integer} w - Width of the image.
     * @param {Integer} h - Height of the image.
     * @return {Array} - Return an array of pixel wih computed pixels.
     *
     * @author Franck Soubès
     */
    
    let new_img = [];
    while(img.length) new_img.push(img.splice(0,w));
    let ker = ((k-1)/2) *2;
    let extremity = new Array(ker).fill(0);
    let leftrightpad = new_img => (extremity).concat(new_img).concat(extremity);
    let lenpad = new_img => Array.from(Array(new_img.length), () => 0);
    let updownpad = new_img => [lenpad(new_img[0])].concat(new_img).concat([lenpad(new_img[0])]);
    let balancedpad = new_img  => new_img.map(new_img => leftrightpad(new_img));
    let imagepadded = new_img => balancedpad(updownpad(new_img));
    let returned_image = imagepadded(new_img);
    
    for (let i =0 ; i<ker;i++ ){
	returned_image.push(returned_image[0]);
	returned_image.unshift(returned_image[0]);
    }
    
    return IntegralImage(returned_image,w,h,k) ;
}

const IntegralImage = function (img ,w,h,k,copy=true){
    
    /**
     * IntegralImage : Compute the four coordinates of the main algorithm.
     *
     * @param {Array} img -  Convolution mask represented by the kernel diameter
     * @param {Integer} w - Height of the image.
     * @param {Integer} h - Width of the image.
     * @param {Integer} k - Convolution mask represented by the kernel diameter (width)
     * @return {Array} - Return an array of pixel wih computed pixels.
     *
     * @author Franck Soubès
     */
    
    let arrayI =[];
    
    for (let x = k-1  ;  x <= h + (k-2) ; x++){
	for(  let y = k-1  ; y <= w+(k-2) ; y++){
	    // push black pixel for abberant coordinnates that'll falsify the results
	    img[x-1][y-1] == 0 && img[x+k-1][y-1] == 0 // left
	    ||img[x+k-1][y+k-1] == 0 && img[x+k-1][y-1]== 0 && img[x+k-1][y+k-1] == 0 // down
	    ||img[x-1][y-1] == 0 && img[x-1][y+k-1] == 0 // up
	    ||img[x+k-1][y+k-1] == 0 && img[x-1][y+k-1] == 0 // right
	    ? arrayI.push(0) // as a result the image will be croped for abberant coordinates
	    : arrayI.push(img[x-1][y-1]-img[x+k-1][y-1]-img[x-1][y+k-1]+img[x+k-1][y+k-1]); 
	}
    }
    return arrayI; // 1d
}

const Variancefilter = function (img, img2,type, w, h,kernel,copy_mode=true) {

    /**
     * Variancefilter : simply apply the variance formula. 
     *
     * @param {Array} img1 - Input image to process.
     * @param {Array} img2 - Input image2 to process.
     * @param {TRaster} type - Type of the image (uint8,uint16,float32).
     * @param {Integer} w - Height of the image.
     * @param {Integer} h - Width of the image.
     * @param {Integer} k - Convolution mask represented by the kernel diameter (width).
     * @return {Array} - Return an array with computed variance.
     *
     * @author Franck Soubès
     */
    
    let filtered=[];
    let arr= Array.from(Array(w), () => NaN);
    let width = arr.map((i,x) => x);
    let result;
    console.log(type);
    let arr1 = Array.from(Array(h), () => NaN);
    let height = arr1.map((j,y)=>y);

    let compute_variance =width.map(x =>{
	height.map(y =>{
		
	    result =  (img2[x +y*w]/Math.pow(kernel,2.00)) - Math.pow(img[x+y*w]/Math.pow(kernel,2.00),2.00) ;
	    result > 255 && type === "uint8"
	    ? filtered[x+y*w] = 255
            : result > 65535 && type === "uint16"
	    ? filtered[x+y*w] = 65535
	    : result>1 && type === "float32"
	    ? filtered[x+y*w] = 1
            :filtered[x+y*w] = result; // because of the noise the uint16 display is not quiet good, maybe also because of the main algorithm ?
	    // when not normalizing it has blue edges and it's more clean, float 32 is ok
	  	    
	});
    });

    
    return filtered;
}
