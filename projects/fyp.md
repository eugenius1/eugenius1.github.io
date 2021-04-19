---
layout: page
title: My MEng Final-Year Project!
subtitle: Fused Arithmetic Analysis for Efficient Hardware Datapath
comments: false
share-buttons: false
sitemap:
  exclude: true
redirect_from:
 - "/fyp/"
---

**In one easy sentence**: I improved a (Python) software tool that's used to further improve digital circuits that perform numerical computations.

Project Supervisor: [Prof. George A. Constantinides](http://cas.ee.ic.ac.uk/people/gac1/)

<a class="btn btn-primary btn-lg" href="/raw/docs/2017/Eusebius_Ngemera_MEng_FYP.pdf">Report (PDF)</a>

# Abstract

During high-level synthesis (HLS) more often than not, standard discrete-arithmetic units are used to synthesise C-like arithmetic programs onto a field-programmable gate array (FPGA).
In this project, I expand on the open-source HLS tool `Structural Optimisation of Arithmetic Programs' (SOAP) to consider fused arithmetic units.

SOAP rewrites a program to produce a set of equivalent programs that are Pareto-optimal in resource usage (area), numerical accuracy and latency.
In this project, just the area and numerical accuracy of individual arithmetic expressions are evaluated.
The fused units implemented are the 3-input adder, fused multiply-add (FMA) and constant multiplier, all acting on floating-point numbers.
SOAP's power of expression transformation is harnessed to expose non-obvious uses of these fused units.

Improvements achieved in some of the inner expressions of PolyBench and Livermore Loops, for single-precision floating-point, are up to 1.13&times; in area without degrading accuracy, and up to 1.4&times; in numerical accuracy at an area cost of up to 2.6&times;.
It is shown that the accuracy improvement can be arbitrarily large under certain conditions.
