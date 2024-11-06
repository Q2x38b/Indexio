from autoscraper import AutoScraper 
url = "https://stackoverflow.com/questions/2081586/web-scraping-with-python" 
wanted_list = [""] 
scraper = AutoScraper()
result = scraper.build(url, wanted_list) 
print (result)