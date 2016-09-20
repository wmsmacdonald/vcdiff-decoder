#!/bin/bash

i="0"

while [ $i -lt 10000 ]
do
vcdiff decode -dictionary angular1.2.min.js < ./delta > output.min.js
i=$[$i+1]
done
