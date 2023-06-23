# Proxy tester

Generate bash script which reads a file containing a list of proxies and tests it.

The format of the file containing the list of proxies is:
```
177.86.182.52:4153
191.186.106.34:8080
192.141.232.12:33998
177.66.43.189:4145
187.86.4.16:4153
```

Being `IP:PORT`


The script perform the following tasks
 - The script generated will test each proxy and print the ones that are working.
 - The script generated will use the curl command and the -x parameter to test the proxies.
 - The user should specify the proxy protocol http/socks4/socks5 as an argument and passed to curl -x parameter.
 - It should receive the file containing the list of proxies as an argument.
 - The default timeout to give up on a proxy should be 5 seconds.
 - To consider a proxy working, it must be able to connect to `https://www.strava.com/` and receive a `200` response script.
 - If a proxy is working it should print how long it took to get the response from strava.
 - Make the code multi-threaded, so it can test multiple proxies at the same time.
 - The default number of threads should be 20.
 - Display help if the arguments are not correct.
 - Make timeout, test url and number of threads as optional arguments
 - Argument handling must use short and long names such as "-p|--protocol" to set the desired protocol