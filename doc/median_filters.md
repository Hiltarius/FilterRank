# Filters 2D (rank filters)
# AUTHORS : *Adrien Rohan, Franck Soubès, Guillamaury Debras

# Link : https://github.com/fsoubes/FilterRank
# 1.Introduction

&nbsp;&nbsp;Since image have been digitized on a computer's memory, it has been possible to interact in new ways with those images that were otherwise impossible. This is called image proccessing, and it consist of methods used to perform operations on a digital image. Those methods are described with various algorithms that can be used for various purposes in multiple fields. Those applications are used for noise filtering and other image enhancement as well as extracting information from images. In this project, will be examined the algorithms used for three types of 2D rank filters : median, min&max and variance.  

&nbsp;&nbsp;  By definition rank filters are non-linear filters using the local gray-level ordering to compute the filtered value[^Soi2002] . The output of the filter is the pixel value selected from a specified position in this ranked list. The ranked list is represented by all the grey values that lies within the window which are sorted, from the smallest to the highest value.
For an identical window the pixel value will differ in function of the filters used (median, min, max and variance). Moreover the size of the window is also influencing the output pixel. 
The median filter is so called because it's an operation which selects the median value.The median filter has been suggested by Tukey[^Tuk1974]. This filter is widely used for reducing certain type of noise and periodic interference patterns in signal and images without severly degrading the signal[^Hua1981].The naive algorithm was then improved based on the moving histogram technique[^Hua1979]. The median filter is used for removing noise, but he main issues of that filter algorithm is his slowness. To overcome these problems the use of small windows and/or low resolution images is required[^Wei2006].


&nbsp;&nbsp;  In this report, we begin by describing the naive and improved algorithms of our median filters. The next step will be to perform a benchmark on different imageJ plugins, with the objective of comparing their performances such as execution time and the memory load for the Java Virtual Machine (JVM). 




# 2.Material & Methods

## Implementation of the median filter


A median filter is a filter that will compute for each pixel of the starting image the median value of all pixels in the neighborhood of this pixel. This implementation is based on the median filter function of the  TIMES module of J.-C. Taveau (https://github.com/crazybiocomputing/times).

A kernel is used to access all the pixel in a neighborhood. A kernel is a small matrix that specify which are in the neighborhood or not of the central pixel in the kernel. They can be of varying size and shape, such as square or circular. This implementation of the median filter take as argument a kernel as defined by the TIMES module of J.-C. Taveau. It consist of an object that contain for each pixel in a kernel the offset in x-coordinate and the offset in y-coordinate of that pixel compared to the central pixel of the kernel. Thus from the coordinate of a single pixel it is possible to find the coordinate of all the pixel in his neighborhood.

From these coordinate the pixels value can then be accessed, and are then stored in an array. The next step in the median filter is then to sort this array of value. This implementation of the median filter use the OpenGL Shading Language (GLSL) for executing code on the GPU. GLSL doesn’t allow the use of recursivity, which mean a sorting algorithm that doesn’t use it had to be implemented. The sorting algorithm that has been implemented is the bubble sort algorithm. Here is a pseudo-code :

	a: an array of sortable element of length N

      swapped = true
      while swapped
        swapped = false
        for j from 0 to N - 1
           if a[j] > a[j + 1]
              swap( a[j], a[j + 1] )
              swapped = true
From the sorted array obtained after running the bubble sort, the median is then defined as N/2 element of the array (assuming the kernel contain always contain an odd number of pixels). This whole process is repeated on all the pixels of the starting image to obtain the filtered image.


## Benchmarking analysis

Benchmarking analysis is  widely used to assess the relative performance of a function[^Fle1896] by comparing the performance of various algorithms and their implementation. In this rapport, only the relative speed of different analysis will be taken into consideration. The ImageJ and the TIMES modules CPU implementation of the median filter will be compared to our WebGL implementation.  The speed of the implementations will be computed for five different sizes of image (180x144, 360x288, 540x432, 720x576 and 900x720) and two different size of kernel (3x3 and 7x7 circular kernel) and three types of images (8-bit, 16-bit and float-32 or (or 32-bit for ImageJ)). For each combination of parameters the function will be run 1000 times (except for the CPU implementation for the 3 larger size of image which are run 100 times).

# 3.Results

## Image results

### Median filter

The Fig 7. show the results obtained using our median filter implementation compared to the ImageJ implementation. While the images 7. B and C aren't easily distinguishable to the naked eye, the image D shows that there ise some difference in pixel value at the border inside the image.

![](images/MontageMedianBoats.png)

#### Fig 7. (A) Original image, (B) image obtained using ImageJ median filter (kernel radius equal 2), (C) image obtained using our implementation (5x5 kernel) and (D) difference between B and C.

### Min/Max filter
![](images/min_max_fusion.png)

#### Fig 8. (A) Original image, (B) image obtained using ImageJ maximum filter (kernel radius equal 1), (C) image obtained using our implementation (3x3 kernel) and (D) difference between B and C.
This figure represents in A the default image (boats 720x576-8bit), B the result of the max filter in imageJ with a radius of 1, C the result of our own function with a kernel size of 3, D the difference between the imageJ and our own filter. Because of the different kind of kernel shapes, we do obtain a slighty difference between the imageJ output and our own which is represented in the figure D.

### Variance filter

The following figure shows the result of our _variance_ function for a boat of 720x576 pixels taking as parameter a kernel of diameter = 2 compared to the variance filter of ImageJ with a kernel radius =0.5. The results are different for mainly two reasons one is that the luminosity between B and C are different and the fact that the kernel on ImageJ is circular whereas our kernel is square.

![](images/merge_from_ofoct.jpg)

#### Fig 9. Result of a variance processing with (A) representing the original image, (B),(C) and (D) are respectively corresponding to the ImageJ _variance_, our _variance_ function and the substraction of those two (B-C).

## Benchmark comparison between ImageJ and our implementation


### Median filter

A comparative benchmark for our own median filter against the median filter from ImageJ has been done with a set of 21 images between seven different resolution :  180x144, 360x288, 540x432, 720x576, 900x720, 1080x864, and 1440x1152. Each set of 3 images have the same resolution but are of a different type, either 8-bit ,16-bit or float32 (or 32-bit for ImageJ). Additionally a benchmark analysis has also been done on the attempted implementation of the Huang algorithm only for 8-bit images. The benchmark results is represented on the Fig 10. 11. and 12 down below :

![](images/MedianPerso_Rplot.png)

#### Fig. 10 Execution time benchmark analysis for the implemented median algorithm for a kernel of size 5x5.

The execution time of the algorithm increase exponentially has the resolution of the image increase. Up until the 720x576 pixels image there is not a noticeable difference in time between the 8-bit, 16-bit and float 32 execution time, while for higher resolution image the 8-bit image become slightly faster. Only the 180x144 pixels image as an execution time below 1s, and the image bigger than the 720x576 have an execution time of more than 10s.

![](images/MedianAltAlgo_Rplot.png)

#### Fig. 11 Execution time benchmark analysis for an alternative algorithm for a kernel of size 5x5.

The execution time for the attempted implementation also increase erapidly in an exponential manner. The execution time is always longer than 1s, and the 1080x864 and  1440x1152 pixels images have a more than1minute execution time.

![](images/Median_ImageJRplot.png)

#### Fig. 12 Execution time benchmark analysis for the ImageJ median algorithm for a kernel of radius 2.

The ImageJ algorithm execution time also increase exponentially. The difference in execution time between the 8-bit, 16-bit and 32-bit is noticeable and increase with time with 8-bit the fastest and 32-bit the slowest.

### Min-Max filter
A comparative benchmark of 50 iterations for our own  Min/Max filter against the Min/Max filter from imageJ has been done with a set of 24 images bewteen eight different resolution 180x144, 360x288, 540x432, 720x576, 900x720, 1080x864, 1440x1152, and 1880x1440. Each set of 3 images have the same resolution but with a different type, either 8bit,16bit or float32. The benchmark representation is represented down below :

![](images/myRplot3.png)

#### Fig 13. Execution time benchmark analysis against the implemented min_max algorithm for a kernel size = 3, filter = max. 
On the figure 13, the execution time for either 8bit,16bit or float32 for an image with the same resolution does not change significantly on either resolution, infact the 3 lines which represent the execution time are close together. For the first 5 resolutions we can see an increase of the execution time from 80ms in general up to 8000 ms. At a resolution of 1440x1140 and higher the line follows an exponential pattern, this is where we find our algorithm limit. Finally our algorithm has the same performance for either 8bit,16bit or float32.

![](images/imageJplot3.png) 

#### Fig 14. Execution time benchmark analysis against the min_max algorithm of ImageJ for a kernel size = 3, filter = max. 
On the figure 14, the execution time from the first resolution to the sixth doesnt change really, also the scale of the benchamrk isnt the same, in fact the imageJ algorithm is way much more efficient than our own implementation. For the first image with a resolution of 180x144 our algorithm takes 50ms to complete the process unlike imageJ algorithm which takes 12ms. When we use the algorithm on all the upsizing images ImageJ algorithm execution time doesn't go higher than 38ms when on the contrary our own algorithm goes until 166067ms for the 1880x1440 resolution. We also see that the imageJ algorithm execution time doesn't change with images of different types, same as our own algorithm.

### Variance filter

A comparative benchmark for our own  Variance filter against the Variance filter from imageJ has been done with a set of 24 images bewteen seven different resolution  360x288, 720x576, 900x720, 1080x864, 1440x1152, 1880x1440 and 2880x2304. Each set of 3 images have the same resolution but with a different type, either 8bit, 16bit or float32. The benchmark representation is represented down below :
	
![](images/plotplot.png)

#### Fig 15. Execution time benchmark analysis against the implemented variance algorithm for a kernel size = 3, filter = Variance. 
On the figure 15, the execution time for either 8bit,16bit or float32 for an image with the same resolution does not change significantly on either resolution, infact the 3 lines which represent the execution time are close together. For the first 6 resolutions we can see an increase of the execution time from 50ms in general up to 4500 ms. At a resolution of 1880x1440 and higher the line follows an exponential pattern, this is where we find our algorithm limit. Finally our algorithm has the same performance for either 8bit,16bit or float32.

![](images/plotij.png) 

#### Fig 16. Execution time benchmark analysis against the variance algorithm of ImageJ for a kernel size = 3, filter = Variance. 
On the figure 16, the execution time from the first resolution to the sixth doesnt change really, also the scale of the benchamrk isnt the same, in fact the imageJ algorithm is way much more efficient than our own implementation. For the first image with a resolution of 360x288 our algorithm takes 50ms to complete the process unlike imageJ algorithm which takes 1.398ms. When we use the algorithm on all the upsizing images ImageJ algorithm execution time doesn't go higher than 80ms for either 16bit or 32bit when on the contrary our own algorithm goes until 20000ms for the 2880x2304 resolution. We also see that the variance imageJ algorithm execution time change between images types. Indeed it takes around 80ms for 16 bit and 32bit against 45ms for 8bit, it's two times faster for filtering an 8bit image compared to 16bit and 32bit whereas there's no particular changes for our function. Moreover 8bit filter is way more faster than for the two other types mainly because of the low complexity values [0...256].

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

# 4.Discussion

## Overall quality comparison between imageJ and our algorithms

For the median filter, slight difference on all the internal border are visible. These differences might be explained by the use of a square kernel in our implementation of the algorithm while the kernel used in ImageJ as a circular shape. The differences would most likely increase with the size of the kernel, because more pixels included in our kernel would not be included in ImageJ kernel.

 For the min_max filter we almost obtain the same results than the imageJ functions, with a same kernel size even if the processing is different the output remains almost the same for any type of kernel or type of images.
 
For the variance filter we obtained the same results as presented in the previous part. Developing this script in ECMAScript 6 tends to gain in term of visibility comparing to the java plugin with nested loops and conditional statements. However it's not totally functional the _Getcoord_ function was not written in functional mainly because the iteration is starting and ending for various size depending on the padding. Moreover _padding_ function add extra rows for the upper and left part of the pixel-matrix. In order to avoid black pixel in the output we're using the available crop method in the times API that process is not included in the main function _variance_.

## Overall performance comparison between imageJ and our algorithms

Our implementation of the median filter is extremely time consuming, with a difference of more than three orders of magnitude of differences on the 900x720 pixels image and the bigger ones. Even for the 180x144 image the difference is more than two order of magnitude longer then the imageJ. These differences, are most likely explained by the algorithm used as well as a lack of optimization of that algorithm, most likely in the gestion of the array, as for each pixel of the image the algorithm iterate on multiple algorithm. On top of that, the use of the sort function is time consuming.

It should be noted that the implementation of the Huang algorithm ended even more time consuming on the images tested. For the smallest image there is a difference of more than one order of magnitude between our 2 tested implementation for 8 b-it images (152ms to 1865ms) while the difference for the biggest image is less than one order of magnitude (70092ms to 138534ms). While our implementation of the Huang algorithm is much slower for normal sized image, it might be faster then our naive implementation for very big image. The padding also has a high cost in time. If the function did not implement the padding the output image would be smaller which might not be very inconveniant for a single use of the filter, but if the function is part of a pipeline of multiple function each not extending the border the image would end noticeably smaller than the input image which is not desirable.
 
 For the min_max filter the execution time of imageJ compared to our algorithm is better for any resolution, altought many variables have to be take into account, first the algorithms were running on mozilla Firefox web-browser which may lead to slowness for long computations. As well, with more optimization our algorithm could be easily faster because of the presence of many loops that may be reduced. Also imageJ algorithm only iterate once through the image pixels unlike our algorithm which has four big steps.
 
 For the variance filter the execution time of ImageJ compared to our algorithm is way more better due to the fact that the algorithms are not similar. Indeed, ImageJ plugin is using convolve function to compute the variance and the mean. Moreover for loops are way more faster than map, reduce or forEach. As said before the benchmark may not be that relevant caused by the web-browser (Firefox) used to perform the benchmark if the version is not up to date. Another explanation for the slowness of our algorithm can be related to the number of times that we iterate through our image. Indeed the _convolve_ function of ImageJ iterates only one time through the image pixels whereas our algorithm has to iterate multiple times multiply. Hence, the complexity will not be the same between both algorithms
 
# 5.Conclusion
In general, the execution time of every algorithm implemented are slower than the ImageJ  especially for high resolution images. The min_max and median algorithm have higher exexution time than the variance algorithm, however we do obtain close results for the similarity of the output images for each algorithm.
For each algorithm we did try to functionalize as much as we could, and curried our functions delivering  fonctional algorithms which work with 8 bit,16bit and float32 images
Finally the different algorithms respect what was developped in the first markdown for instance the min_max algorithm respects the process of 1D filter after 1D filter described in the first markdown, and the variance algorithm respects the algorithm proposed to calculate the variance of an image. On the other hand, the median filter has been implemented using a naive algorithm because the attempted implementation of the Huang algorithm ended more time consuming.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;




## References

[^Hua1979] Huang T, Yang G, Tang G. A fast two-dimensional median filtering algorithm. IEEE Transactions on Acoustics, Speech, and Signal Processing. 1979;27(1):13–18.  

[^Hua1981] Huang TS. Two-dimensional digital signal processing II: transforms and median filters. Springer-Verlag New York, Inc.; 1981.

[^Wei2006] Weiss B. Fast median and bilateral filtering. 2006;25(3):519–526.
Acm Transactions on Graphics (TOG).  
 

[^Gil1993] Gil J, Werman M. Computing 2-D min, median, and max filters. IEEE Transactions on Pattern Analysis and Machine Intelligence. 1993;15(5):504–507.  

[^Fab2011] Fabijańska A. Variance filter for edge detection and edge-based image segmentation. In: Perspective Technologies and Methods in MEMS Design (MEMSTECH), 2011 Proceedings of VIIth International Conference on. IEEE; 2011. p. 151–154.  

[^Sar2015] Sarwas G, Skoneczny S. Object localization and detection using variance filter. In: Image Processing & Communications Challenges 6. Springer; 2015. p. 195–202.  

[^Vio2001] Viola P, Jones M. Rapid object detection using a boosted cascade of simple features. In: Computer Vision and Pattern Recognition, 2001. CVPR 2001. Proceedings of the 2001 IEEE Computer Society Conference on. vol. 1. IEEE; 2001. p. I–I.  


[^Soi2002] Soille P. On morphological operators based on rank filters. 2002;35(2):527–535. Pattern recognition.  

[^Tuk1974] Tukey J. Nonlinear (nonsuperposable) methods for smoothing data. Congr Rec 1974 EASCON. 1974;673.  

[^Wer1985] Werman M, Peleg S. Min-max operators in texture analysis. IEEE transactions on pattern analysis and machine intelligence. 1985;(6):730–733.  

[^Can1986] Canny J. A computational approach to edge detection. IEEE Transactions on pattern analysis and machine intelligence. 1986;(6):679–698.  

[^Kit1983] Kittler J. On the accuracy of the Sobel edge detector. 1983;1(1):37–42. Image and Vision Computing. 

[^Mar1980] Marr D, Hildreth E. Theory of edge detection. Proceedings of the Royal Society of London B: Biological Sciences 1980;207(1167):187–217.

[^Fle1896] Philip J. Fleming and John J. Wallace. 1986. How not to lie with statistics: the correct way to summarize benchmark results. Commun. ACM 29, 3 (March 1986), 218-221.

[^BRA2007] Bradley D, Roth G. Adaptive thresholding using integral image. Journal of Graphics Tools. Volume 12, Issue 2. pp. 13-21. 2007. NRC 48816.

[^SHI2017] Shivani Km, A Fast Integral Image Computing Methods: A Review Design Engineer, Associated Electronics Research Foundation, C-53, Phase-II, Noida (India)
