---
layout: project
title: EE3-RTDSP
subtitle: Real-Time Digital Signal Processing
share-img: "/img/projects/ee3-rtdsp/lynx.png"
comments: true
github: eugenius1/ee3-rtdsp
---

> Telephones are increasingly being used in noisy environments such as cars, airports and undergraduate laboratories! The aim of this project is to implement **a real-time system that will reduce the background noise in a speech signal while leaving the signal itself intact**: this process is called speech enhancement.<br><br>
~ Professor Paul D. Mitcheson, Imperial College London Department of Electrical & Electronic Engineering, 2016.

This 3<sup>rd</sup> year project involved understanding Real-Time Digital Signal Processing and putting it into practice on a Texas Instruments DSP Starter Kit (TMS320C6713 DSK). The diagram below shows 3 spectograms. A spectogram is effectively a photograph of sound; a visual representation of a sound's frequency distribution over time. First is noisy sound, then the filtered version, and finally clean speech for comparison.

[![Spectograms that show speech with reduced noise from a lynx helicopter](/img/projects/ee3-rtdsp/lynx.png "Spectograms for speech with noise from a lynx helicopter")](/raw/img/projects/ee3-rtdsp/lynx.png)

The [final report](https://github.com/eugenius1/ee3-rtdsp/blob/master/speech-enhancement/EusebiusN_And_PrahnavS_RTDSP_Project.pdf) is available on GitHub. To sum up, these are the goals achieved towards the end of the project.

## Lab 5: IIR Filtering

Objectives accomplished:

* Learned to design IIR (Infinite-Impulse Response) digital filters using MATLAB.
* Implemented the IIR filter using the C6713 DSK system in real-time.
* Measured the filter characteristics using a spectrum analyzer.

[Lab 5 Report](https://github.com/eugenius1/ee3-rtdsp/blob/master/lab5-iir/EusebiusN_And_PrahnavS_RTDSP_Lab5.pdf) is available on GitHub.

## Project: Speech Enhancement through noise reduction

Objectives accomplished:

* Implemented triple buffering: *input*, *processing*, and *output* buffers.
* Implemented various noise estimation and noise reduction techniques,
* Compared their performance and chose parameters that produced the best audible speech enhancement.
