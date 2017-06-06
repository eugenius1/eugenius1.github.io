---
layout: page
title: My MEng Final-Year Project!
subtitle: Fused Arithmetic Analysis for Efficient Hardware Datapath
comments: false
share-buttons: false
sitemap:
  exclude: true
---

Project Supervisor: [Prof. George A. Constantinides](http://cas.ee.ic.ac.uk/people/gac1/)

Full report will appear here on 21<sup>st</sup> June 2017.

# Abstract

During high-level synthesis (HLS) more often than not, standard discrete-arithmetic units are used to synthesise C-like arithmetic programs onto a field-programmable gate array (FPGA). In this project, I expand on the open-source HLS tool `Structural Optimisation of Arithmetic Programs' (SOAP) to consider fused arithmetic units.

SOAP produces a set of Pareto-optimal equivalent programs that improve on resource usage (area), numerical accuracy and latency. In this project, just the area and numerical accuracy of individual arithmetic expressions are evaluated. The fused units implemented are the 3-input adder, fused multiply-add (FMA) and constant multiplier, all acting on floating-point numbers. SOAP's power of expression transformation is harnessed to expose non-obvious uses of these fused units.

Improvements achieved in some of the inner expressions of PolyBench and Livermore Loops are up to 1.3&times; in area and up to 1.3&times; in numerical accuracy at an area cost of up to 3.9&times;. It is shown that the accuracy improvement has the potential to scale with the number of iterations performed. It is also shown that the accuracy improvement can be arbitrarily large under certain conditions.