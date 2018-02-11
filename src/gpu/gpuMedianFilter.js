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
 */

'use script';
/**
 * median filter
 *
 * @author Adrien Rohan
 * (adapted from Jean-Christophe Taveau rankFilters for cpu : https://github.com/crazybiocomputing/times/blob/master/src/cpu/process/rankFilters.js)
 */

const medianFilter = (raster, graphContext, kernel, copy_mode = true) => {

    //Create GPU kernel
    const kernelSize = kernel.length;
    let horizontalOffset = new Float32Array(kernel.length);
    let verticalOffset = new Float32Array(kernel.length);
    for (let i=0; i<kernel.length; i++){
	horizontalOffset[i]=kernel[i].offsetX;
	verticalOffset[i]=kernel[i].offsetY;
    }

    let id='Adrien';
    
    let src_vs = `#version 300 es

	in vec2 a_vertex;
	in vec2 a_texCoord;
    
    uniform vec2 u_resolution;
    
    out vec2 v_texCoord;
    
    void main() {
	v_texCoord = a_texCoord;
	vec2 clipSpace = a_vertex * u_resolution * 2.0 - 1.0;
	gl_Position = vec4( clipSpace * vec2(1,-1), 0.0, 1.0);
    }`;


    const getFragmentSource = (samplerType,outVec,kernelLength,vectorType) => {
	return `#version 300 es
        #pragma debug(on)

	precision mediump usampler2D;
	precision mediump float;
	
	    in vec2 v_texCoord;
	const float maxUint16 = 65535.0;
	uniform ${samplerType} u_image;
	uniform int u_sizeKernel;
	uniform float u_horizontalOffset[${kernelLength}];
	uniform float u_verticalOffset[${kernelLength}];
	uniform float u_height;
	uniform float u_width;
	out vec4 outColor;
	
	void main() {
	    int median = ${kernelLength}/2;
	    ${vectorType} kernelContent[${kernelLength}];
	    for (int i = 0; i < ${kernelLength}; i=i+1){
		kernelContent[i] = texture(u_image, vec2(v_texCoord.x + u_horizontalOffset[i] / u_width, v_texCoord.y + u_verticalOffset[i] / u_height)).rgb;
	    }
	    int i, j;
	    ${vectorType} temp;	
	    for (i = 0; i < ${kernelLength}; i++){
		for (j = 0; j < ${kernelLength} - 1; j++){
		    if (kernelContent[j + 1].r + kernelContent[j + 1].g + kernelContent[j + 1].b < kernelContent[j].r + kernelContent[j].g + kernelContent[j].b){
			temp = kernelContent[j].rgb;
			kernelContent[j].rgb = kernelContent[j + 1].rgb;
			kernelContent[j + 1].rgb = temp;
		    }
		}
	    }
	    outColor = vec4(${outVec}, 1.0); 
	}`;
    }

    // Step #1: Create - compile + link - shader program
    // Set up fragment shader source depending of raster type (uint8, uint16, float32,rgba)
    let samplerType = (raster.type === 'uint16') ? 'usampler2D' : 'sampler2D';
    let vectorType = (raster.type === 'uint16') ? `uvec3` : `vec3`;
    let outColor;
    switch (raster.type) {
    case 'uint8':  
    case 'rgba' : outColor = `kernelContent[median].rgb`; break; 
    case 'uint16': outColor = `vec3(float(kernelContent[median].r) / maxUint16 )`; break; 
    case 'float32': outColor = `vec3(kernelContent[median].r)`; break; 
    }

    // Step #1: Create - compile + link - shader program
    let the_shader = gpu.createProgram(graphContext,src_vs,getFragmentSource(samplerType,outColor, kernel.length, vectorType));
    
    
    // Step #2: Create a gpu.Processor, and define geometry, attributes, texture, VAO, .., and run
    let gproc = gpu.createGPU(graphContext)
	.size(raster.width,raster.height)
	.geometry(gpu.rectangle(raster.width,raster.height))
	.attribute('a_vertex', 2, 'float', 16, 0)      // X, Y
	.attribute('a_texCoord', 2, 'float', 16, 8)  // S, T
	.texture(raster, 0)
	.packWith(the_shader) // VAO
	.clearCanvas([0.0,1.0,1.0,1.0])
	.preprocess()
	.uniform('u_resolution',new Float32Array([1.0/raster.width,1.0/raster.height]))
	.uniform('u_image',0)
	.uniform('u_horizontalOffset', horizontalOffset)
	.uniform('u_verticalOffset', verticalOffset)
	.uniform('u_height', raster.height)
	.uniform('u_width', raster.width)
	.run();
    
    return raster;
}



