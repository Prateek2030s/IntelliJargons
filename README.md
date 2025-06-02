README for IntelliJargons

Team Name: 

IntelliJargons


Proposed Level of Achievement:

Apollo 11


Motivation 

Reading long and complex documents can be tedious and time-consuming, especially when encountering unfamiliar terminology. 

Existing solutions, like Apple’s search function, require manual input to look up terms. Such look-ups with just the key terms often return explanations poorly related to the context of reading, while searching with more detail increases the time cost to sieve search results. Generating explanations with GenAI requires a similarly trivial process of inputting contexts, and adds new problems such as delusional sources. 

A solution in short, is that we simply wish all documents come with a personalised glossary explaining all the key terms based on my existing knowledge and within the context of the document. Whenever jargons disrupt the reading flow, we wish that this glossary would pop up with an appropriate explanation. 


User Stories

As a student who reads research papers, I want to receive instant explanations for technical terms so I can understand contents faster.
As a start-up owner reviewing contracts, I want the system to highlight and explain legal jargon to save time and ensure accuracy in my understanding.
As a business consultant reading reports, I want financial and industry-specific terms to be defined automatically for quick insights.


Scope of Project

IntelliJargons aims to fulfill the wish as an Augmented Document Reader that utilizes GenAIs to create the personalised contextual glossary. It should analyze the document content, identify relevant key terms, and generate concise one-line explanations dynamically. It should improve reading efficiency, comprehension, and accessibility for users handling technical or complex documents. 

IntelliJargons provides an API for users to view the prompts and resources fed to the GenAI and allow them to modify along the way. It registers a glossary, allowing users to source explanations based on their own preferences.


Features

Core Features (MVP):

Document Upload & Parsing 
IntelliJargons caches the uploaded documents in each user’s account. It supports documents of different formats. Uploaded documents are parsed and stored in databases related to each account.

AI-generated Glossary
IntelliJargons identifies jargons related to the theme, and generates a glossary for the Jargons. This page records the automatically generated glossary, with each term supporting modification and re-generation.

AI-Powered One-Liner Explanations
Within each entry in the glossary, the highlighted terms capture the key idea which contributes to the one-liner explanation users see in the reader tabs.
 
Reader
This is the core feature of IntelliJargons. Its UI design is similar to existing PDF readers. When users hover their mouse over jargons recorded in the glossary, a box pops out next to his cursor with the 1-liner explanation in it. 

Extended Features:

Export Annotations
Saves processed documents with highlighted definition, as well as the glossary, in a format according to user’s demand.

FlashCard Generation
Generates a stack of flashcards, each card containing a fill-in-the-blank question about the jargon that facilitates memorisation. 



Proof of Concept

Our code for the technical proof of concept is also readily available in the following github repository:
Prateek2030s/IntelliJargons: repo of Team ID: 7164 Orbital 25

Video demo:
https://drive.google.com/file/d/1wlNx65Jfr4XTUlZDKUQXIMRtGJSf2eUP/view?usp=sharing

Project Log

Our project log is accessible through the following Google Sheets link:
IntelliJargons Project Log - Google Sheets

