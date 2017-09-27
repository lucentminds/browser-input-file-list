# Title
ADR-001: Genesis.

# Summary
Created a general purpose library for handling files selected in the browser on a web page form.

# Context
Once one or more files are selected on a form in a browser it can be complicated to keep track of those files and monitor them as they are uploaded. For instance one file selected reads as `11` bytes, but while uploading with other parameters, the total bytes may be `431` bytes.

# Decision
I will create a library with an api to simplify the management of such file interfaces. It should have an intuitive interface so it's easy to guess how to use it without mountains of documentation.

# Consequences
Some browsers will not be compatible, but in the end this library can be used without any specific javascript framework.

# Status
Accepted