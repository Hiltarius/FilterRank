# Filters 2D (rank filters)
# AUTHORS :  Guillamaury Debras
# Link to <img src="https://github.com/fsoubes/FilterRank " alt="our project GitHub" />
# 1.Introduction

&nbsp;&nbsp;Since image have been digitized on a computer's memory, it has been possible to interact in new ways with those images that were otherwise impossible. This is called image proccessing, and it consist of methods used to perform operations on a digital image. Those methods are described with various algorithms that can be used for various purposes in multiple fields. Those applications are used for noise filtering and other image enhancement as well as extracting information from images. In this project, will be examined the algorithms used for three types of 2D rank filters : minimum and maximum. 

&nbsp;&nbsp;  By definition rank filters are non-linear filters using the local gray-level ordering to compute the filtered value[^Soi2002] . The output of the filter is the pixel value selected from a specified position in this ranked list. The ranked list is represented by all the grey values that lies within the window which are sorted, from the smallest to the highest value.
For an identical window the pixel value will differ in function of the filters used (median, min, max and variance). Moreover the size of the window is also influencing the output pixel. 
The filter that chooses the maximum or minimum values is called the maximum filter or the minimum filter. In discrete mathematical morphology, the minimum and maximum ranks play a key role since they correspond to the fundamental erosion and dilation operators[^Soi2002][^Wer1985]. Lastly the variance filter is used to edge detection. Edges can be detected using the 1st (Sobel or Cany approaches[^Can1986][^Kit1983]) or 2nd deriviates(Log approach[^Mar1980]) of the grey level intensity. Nevertheless there's other alternatives using synthetic and real images with the variance filter[^Fab2011]. As demonstrated here our three main filters have their own field of expertise. 


&nbsp;&nbsp; In this project we hhave to use a Web Graphics Library also called as WebGL which is a Javascript API for rendering interactive 2D and 3D grphics. Without using any plug-ins this can be used within any web browser. WebGL is an implementation of OpenGL ES 2.0. WebGL Library is based on allowing GPU-accelerated usage of both physics and image processing but also effects which'll become part of the web page canvas. The maintainer and designer of the WebGL Library is the non-profit Khronos Group. The program is a mix of code writen in Javascript plus shader code written in a language called OpenGL Shading Language or (GLSL), this language is extremely similar to C++ code. The principle of this Library is that the code is executed on a GPU (graphics processing unit) and not CPU for ( Central processing unit).



&nbsp;&nbsp;  In this report, we shall begin by describing the implementation of our algorithm in GPU mode of our 2 different filters. 

* Min/Max filter


Next step will be to perform a benchmark on different imageJ plugins, with the objective of comparing their performances such as execution time  for the Java Virtual Machine (JVM). The ImageJ plugins compared are the default ImageJ RankFilters plugin which has implementation for maximum and minimum  filters and the FastFilters plugin, which contains implementation for the maximum and minimum filters.  




# 2.Material & Methods



## Implementation of the GPU min/max filter

In the priveous reports, we discussed about a min_max filter function whichs operate with consecutiv 1D filters, first in row then in colomns[^Gil1993] and his CPU implementation. In this report we describe the implementation of the same king of filter but in a GPU environment.

The first part of our algorithm is the creation of the GPU kernel. In order to do so we set up 2 offset, horizontal and vertical described as the pseudo code down below :

           (for  i in kernel.length){
	                 horizontalOffset[i]=kernel[i].offsetX;
	                 verticalOffset[i]=kernel[i].offsetY;
                   }
                    
The second step of our implementation is the construction of the vertex shader by initializing vertices and texture coordinates.

The third step of our GPU implementation is the minimum or maximum filter itself based on the _getFragmentSource_ function, which takes as parameters the type of sample, the type of image and the kernel length.


### Texture output
In order to get each value for a random kernel we use the _texture_ method according to the followed pseudo code :


        (for i in kernel){
		           kernelContent[i] = texture(u_image, vec2(v_texCoord.x + u_horizontalOffset[i] / u_width, v_texCoord.y +            
             u_verticalOffset[i] / u_height)).rgb;
	            }
 

### Sort of the values inside the kernel
In order to obtain the minimum and maximum values we decide to go through a basic sorting process with two loops with the pseudo code down below :

	       (for i in kernel.length){
		          (for j in kernel.length){
		              if (kernelContent[j + 1].r + kernelContent[j + 1].g + kernelContent[j + 1].b < kernelContent[j].r +  
                   kernelContent[j].g + kernelContent[j].b){
			                    temp = kernelContent[j].rgb;
			                    kernelContent[j].rgb = kernelContent[j + 1].rgb;
			                    kernelContent[j + 1].rgb = temp;
		               }
		          }
	       }
We calculate for each index+1 values of blue,red and green if they are lower to the actual respectiv values if that's the case then we start to sort the array containing the values.


### Defining minimum or maximum values inside the kernel values

Once the array is finally sorted from the minimum to the maximum, it is simple to convert all the values into either the min or max values. The following code is down below :

	      ${vectorType} max = kernelContent[0].rgb;
	      for (p = 0; p < ${kernelLength}; p++){
		         kernelContent[p].rgb = max;
	         }


Finally the fourth and last part of our algorithm is the creation of the fragment shader source which depends of the raster type. We took the liberty of using the same example of the one that Mr Jezn-Christophe Taveau gave us accessible at @https://github.com/crazybiocomputing/times/tree/master/src/gpu.




## Benchmarking analysis
Benchmarking analysis is a method widely used to assess the relative performance of an object[^Fle1896]. That way, it's possible to compare the performance of various algorithms. Only execution time and memory load will be analysed here. In order to perform this benchmark, one script was implemented. The first script, named *benchmark2* whose aim is to compute the time speed between the start and the end of an input image coming from ImageJ during the filtering process. This script was implemented using the ImageJ macro language. 
The operation process is run 1000 times for ImageJ measurements to provide robust data. In order to not recording false values we're not considering the first 100 values. Indeed during the execution, we must take into account the internal allocations of the loading images which may introduce error in our measurement. For our own algorithm we did  100 iterations .

For this project the benchmark was performed with the operating system Linux (4.9.0-3-amd64)  using the 1.8.0_144 version of Java and running with the 1.51q version of ImageJ. The model image of this benchmark is the blob for various pixels size.
# 3.Results

## Image results
![](https://github.com/fsoubes/FilterRank/blob/master/images/finamerge.png)
#### Fig 1. Comparativ results of the blob image between imageJ, our CPU and GPU implementation using a radius of 5 either on maximum or minimum filter. (A) image obtained with ImageJ maximum filter, (B) image obtained using our CPU implementation, (C) image obtained using our GPU implementation, (D) image obtained with ImageJ minimum filter, (E) image obtained using our CPU implementation with minimum filter, (F) image obtained using our GPU implementation with minimum filter.
This figure represents in A and D the default image (blobs 256x254-8bit) respectively using maximun and minimum filter, B and E the result of the max and minimum filters with our last CPU implementation. Last, C and F the result of the maximum and minimum filters with our GPU implementation. Because of the different kind of kernel shapes, we do obtain a slighty difference between the imageJ output and our own CPU implementation. The GPU implementation seems to be the same than our CPU implementation rather than the imagJ results.


![](https://github.com/fsoubes/FilterRank/blob/master/images/finamerge.png)
#### Fig 2. Comparativ results of the blob image between imageJ and GPU implementation using a radius of 5 either on maximum or minimum filter. (A) image obtained with the function ImageCalculator Substract with ImageJ maximum filter and our GPU implmeentation, (B) image obtained with the function ImageCalculator Substract with ImageJ minimum filter and our GPU implmementation.
This figure represents in A resulting image (blobs 256x254-8bit) respectively using maximum filter GPU implementation output and maximum filter from ImageJ, we can see the edges of each blob, this may due to a slighty different shape and radius between GPU and ImageJ kernel type. We obtain the same kind of pattern for the substract of the minimum filter.


## Benchmark comparison between ImageJ and our CPU and GPU implementation



### Min-Max filter
A comparative benchmark of 100 iterations for our own CPU and GPU Min/Max filters against the Min/Max filters from imageJ and our last CPU implmeentation has been done with a set of 24 images bewteen eight different resolution 180x144, 360x288, 540x432, 720x576, 900x720, 1080x864, 1440x1152, and 1880x1440. Each set of 3 images have the same resolution but with a different type, either 8bit,16bit or float32. The benchmark representation is represented down below :

![](https://github.com/fsoubes/FilterRank/blob/master/images/myRplot3.png)
#### Fig 13. Execution time benchmark analysis against the implemented min_max algorithm for a kernel size = 3, filter = max. 
On the figure 13, the execution time for either 8bit,16bit or float32 for an image with the same resolution does not change significantly on either resolution, infact the 3 lines which represent the execution time are close together. For the first 5 resolutions we can see an increase of the execution time from 80ms in general up to 8000 ms. At a resolution of 1440x1140 and higher the line follows an exponential pattern, this is where we find our algorithm limit. Finally our algorithm has the same performance for either 8bit,16bit or float32.

![](https://github.com/fsoubes/FilterRank/blob/master/images/imageJplot3.png) 
#### Fig 14. Execution time benchmark analysis against the min_max algorithm of ImageJ for a kernel size = 3, filter = max. 
On the figure 14, the execution time from the first resolution to the sixth doesnt change really, also the scale of the benchamrk isnt the same, in fact the imageJ algorithm is way much more efficient than our own implementation. For the first image with a resolution of 180x144 our algorithm takes 50ms to complete the process unlike imageJ algorithm which takes 12ms. When we use the algorithm on all the upsizing images ImageJ algorithm execution time doesn't go higher than 38ms when on the contrary our own algorithm goes until 166067ms for the 1880x1440 resolution. We also see that the imageJ algorithm execution time doesn't change with images of different types, same as our own algorithm.



# 4.Discussion
## Overall quality comparison between imageJ and our algorithms

For the median filter, slight difference on all the internal border are visible. These differences might be explained by the use of a square kernel in our implementation of the algorithm while the kernel used in ImageJ as a circular shape. The differences would most likely increase with the size of the kernel, because more pixels included in our kernel would not be included in ImageJ kernel.

 For the min_max filter we almost obtain the same results than the imageJ functions, with a same kernel size even if the processing is different the output remains almost the same for any type of kernel or type of images.
 
For the variance filter we obtained the same results as presented in the previous part. Developing this script in ECMAScript 6 tends to gain in term of visibility comparing to the java plugin with nested loops and conditional statements. However it's not totally functional the _Getcoord_ function was not written in functional mainly because the iteration is starting and ending for various size depending on the padding. Moreover _padding_ function add extra rows for the upper and left part of the pixel-matrix. In order to avoid black pixel in the output we're using the available crop method in the times API that process is not included in the main function _variance_.

## Overall performance comparison between imageJ and our algorithms

It should be noted that the implementation of the Huang algorithm ended even more time consuming on the images tested. For the smallest image there is a difference of more than one order of magnitude between our 2 tested implementation for 8 b-it images (152ms to 1865ms) while the difference for the biggest image is less than one order of magnitude (70092ms to 138534ms). While our implementation of the Huang algorithm is much slower for normal sized image, it might be faster then our naive implementation for very big image. The padding also has a high cost in time. If the function did not implement the padding the output image would be smaller which might not be very inconveniant for a single use of the filter, but if the function is part of a pipeline of multiple function each not extending the border the image would end noticeably smaller than the input image which is not desirable.
 
 For the min_max filter the execution time of imageJ compared to our algorithm is better for any resolution, altought many variables have to be take into account, first the algorithms were running on mozilla Firefox web-browser which may lead to slowness for long computations. As well, with more optimization our algorithm could be easily faster because of the presence of many loops that may be reduced. Also imageJ algorithm only iterate once through the image pixels unlike our algorithm which has four big steps.
 
 
 
# 5.Conclusion
In general, the execution time of every algorithm implemented are slower than the ImageJ  especially for high resolution images. The min_max and median algorithm have higher exexution time than the variance algorithm, however we do obtain close results for the similarity of the output images for each algorithm.
For each algorithm we did try to functionalize as much as we could, and curried our functions delivering  fonctional algorithms which work with 8 bit,16bit and float32 images
Finally the different algorithms respect what was developped in the first markdown for instance the min_max algorithm respects the process of 1D filter after 1D filter described in the first markdown, and the variance algorithm respects the algorithm proposed to calculate the variance of an image. On the other hand, the median filter has been implemented using a naive algorithm because the attempted implementation of the Huang algorithm ended more time consuming.




## References

[^Hua1979]: Huang T, Yang G, Tang G. A fast two-dimensional median filtering algorithm. IEEE Transactions on Acoustics, Speech, and Signal Processing. 1979;27(1):13–18.  

[^Hua1981]: Huang TS. Two-dimensional digital signal processing II: transforms and median filters. Springer-Verlag New York, Inc.; 1981.

[^Wei2006]: Weiss B. Fast median and bilateral filtering. 2006;25(3):519–526.
Acm Transactions on Graphics (TOG).  
 

[^Gil1993]: Gil J, Werman M. Computing 2-D min, median, and max filters. IEEE Transactions on Pattern Analysis and Machine Intelligence. 1993;15(5):504–507.  

[^Fab2011]: Fabijańska A. Variance filter for edge detection and edge-based image segmentation. In: Perspective Technologies and Methods in MEMS Design (MEMSTECH), 2011 Proceedings of VIIth International Conference on. IEEE; 2011. p. 151–154.  

[^Sar2015]: Sarwas G, Skoneczny S. Object localization and detection using variance filter. In: Image Processing & Communications Challenges 6. Springer; 2015. p. 195–202.  

[^Vio2001]: Viola P, Jones M. Rapid object detection using a boosted cascade of simple features. In: Computer Vision and Pattern Recognition, 2001. CVPR 2001. Proceedings of the 2001 IEEE Computer Society Conference on. vol. 1. IEEE; 2001. p. I–I.  


[^Soi2002]: Soille P. On morphological operators based on rank filters. 2002;35(2):527–535. Pattern recognition.  

[^Tuk1974]: Tukey J. Nonlinear (nonsuperposable) methods for smoothing data. Congr Rec 1974 EASCON. 1974;673.  

[^Wer1985]: Werman M, Peleg S. Min-max operators in texture analysis. IEEE transactions on pattern analysis and machine intelligence. 1985;(6):730–733.  

[^Can1986]: Canny J. A computational approach to edge detection. IEEE Transactions on pattern analysis and machine intelligence. 1986;(6):679–698.  

[^Kit1983]: Kittler J. On the accuracy of the Sobel edge detector. 1983;1(1):37–42. Image and Vision Computing. 

[^Mar1980]: Marr D, Hildreth E. Theory of edge detection. Proceedings of the Royal Society of London B: Biological Sciences 1980;207(1167):187–217.

[^Fle1896]: Philip J. Fleming and John J. Wallace. 1986. How not to lie with statistics: the correct way to summarize benchmark results. Commun. ACM 29, 3 (March 1986), 218-221.

[^BRA2007]: Bradley D, Roth G. Adaptive thresholding using integral image. Journal of Graphics Tools. Volume 12, Issue 2. pp. 13-21. 2007. NRC 48816.

[^SHI2017]: Shivani Km, A Fast Integral Image Computing Methods: A Review Design Engineer, Associated Electronics Research Foundation, C-53, Phase-II, Noida (India)
