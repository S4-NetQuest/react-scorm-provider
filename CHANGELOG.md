# 0.1.2 (July 24, 2018)

Improved documentation.

Bug Fix
* ScormProvider
* * On creation of the SCORM API connection, learnerName now performs a check for the SCORM version before attempting to get the learner name value and makes the correct API call based on the version.

# 0.1.1 (July 20, 2018)

Bug Fix
* withScorm HOC
* * Fix to return a WithScorm component so React DevTools does not show the return from withScorm() as an `<Unknown>` component.

Feature Change
* ScormProvider Component
* * Now accepts 2 optional configuration props:
* * * version: Specify the SCORM API version, accepts "1.2" or "2004". This is optional and probably not needed, as the included API wrapper will automatically attempt to connect to any SCORM API it can find
* * * debug: Optional (defaults to true), accepts boolean type. Specify if the SCORM API should be in debug mode.