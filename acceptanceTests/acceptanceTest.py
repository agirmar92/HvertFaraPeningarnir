# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
from pyvirtualdisplay import Display
import unittest, time, re

class SeleniumAcceptanceTests(unittest.TestCase):
    def setUp(self):
        self.display = Display(visible=0, size=(1920, 1080))
        self.display.start()
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(10)
        self.base_url = "http://localhost:8000/"
        self.verificationErrors = []
        self.accept_next_alert = True

    def test_expenses_drilldown(self):
        print("test_expenses_drilldown:\n======================")
        driver = self.driver
        # Open up the website
        driver.get(self.base_url)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/0/n/n/n/n/n", driver.current_url)
        self.assertEqual("100%", driver.find_element_by_id("hfp-percentage").text)
        driver.find_element_by_id("menu-toggle").click()
        driver.find_element_by_xpath("//div[@id='option0']/div[2]/span").click()
        time.sleep(1)

        # Slice "Menntamál" clicked in pie
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/1/3/n/n/n/n", driver.current_url)
        self.assertEqual("54.6%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Menntamál", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Slice "Æskulýðs- og íþróttamál" clicked in pie
        driver.find_element_by_css_selector("[id*=_segment1]").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/2/3/06/n/n/n", driver.current_url)
        self.assertEqual("13.7%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Menntamál > Æskulýðs- og íþróttamál", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Slice "Félagsmiðstöðvar" clicked in sidebar
        driver.find_element_by_xpath("//div[@id='option2']/div[6]/span").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/3/3/06/063/n/n", driver.current_url)
        self.assertEqual("0.6%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Menntamál > Æskulýðs- og íþróttamál > Félagsmiðstöðvar", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Jump straight to primary finance keys without selecting a department
        driver.find_element_by_id("option-text2").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/4/3/06/063/n/n", driver.current_url)
        self.assertEqual("0.6%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Menntamál > Æskulýðs- og íþróttamál > Félagsmiðstöðvar", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Slice "Vörukaup" clicked in sidebar
        driver.find_element_by_xpath("//div[@id='option4']/div[4]/span").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/5/3/06/063/n/2000", driver.current_url)
        self.assertEqual("kr. 7.955.093.-", driver.find_element_by_xpath("//div[@id='hfp-progress']/p").text)
        self.assertEqual(u"Menntamál > Æskulýðs- og íþróttamál > Félagsmiðstöðvar > Vörukaup", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Slice "Orka" clicked in pie (click on the label)
        driver.find_element_by_id("menu-toggle").click()
        driver.find_element_by_css_selector("[id*=_segmentMainLabel2-outer]").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/6/3/06/063/n/2500", driver.current_url)
        self.assertEqual("kr. 1.492.291.-", driver.find_element_by_xpath("//div[@id='hfp-progress']/p").text)
        self.assertEqual(u"Menntamál > Æskulýðs- og íþróttamál > Félagsmiðstöðvar > Vörukaup > Orka", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Make sure slices "Rafmagn" and "Heitt vatn" are present and no third slice
        self.assertTrue(self.is_element_present(By.CSS_SELECTOR, "[id*=_segment0]"))
        self.assertEqual("Heitt vatn", driver.find_element_by_css_selector("[id*=_segmentMainLabel0-outer]").text)
        self.assertTrue(self.is_element_present(By.CSS_SELECTOR, "[id*=_segment1]"))
        self.assertEqual("Rafmagn", driver.find_element_by_css_selector("[id*=_segmentMainLabel1-outer]").text)
        self.assertFalse(self.is_element_present(By.CSS_SELECTOR, "[id*=_segment2]"))

    def test_joint_revenues_drilldown(self):
        print("\ntest_joint-revenues_drilldown:\n======================")
        driver = self.driver
        # Open up the website
        driver.get(self.base_url)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/0/n/n/n/n/n", driver.current_url)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        driver.find_element_by_id("menu-toggle").click()
        time.sleep(1)
        self.assertEqual(u"Gjöld, 2014", driver.find_element_by_css_selector("[id*=_title]").text)
        # Set to view joint revenues
        driver.find_element_by_id("type-button").click()
        driver.find_element_by_link_text("Sameiginlegar tekjur").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/joint-revenue/2014-0/3/n/n/", driver.current_url)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual("kr. 18.529.125.975.-", driver.find_element_by_xpath("//div[@id='hfp-progress']/p").text)
        self.assertEqual("Sameiginlegar tekjur, 2014", driver.find_element_by_css_selector("[id*=_title]").text)
        self.assertEqual("Allar deildir", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Click slice "Útsvar" in sidebar
        driver.find_element_by_xpath("//div[@id='option3']/div[2]").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/joint-revenue/2014-0/4/00-011/n/", driver.current_url)
        self.assertEqual("80.2%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Útsvar", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Click slice "Tekjur" in pie
        driver.find_element_by_css_selector("[id*=_segment0]").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/joint-revenue/2014-0/5/00-011/0000/", driver.current_url)
        self.assertEqual("80.2%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Útsvar > Tekjur", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Go directly to finance keys, skipping secondary keys
        driver.find_element_by_css_selector("div.option-header.header6 > #option-text2").click()
        time.sleep(1)
        self.assertEqual("http://localhost:8000/#/joint-revenue/2014-0/6/00-011/0000/", driver.current_url)
        self.assertEqual("80.2%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Útsvar > Tekjur", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        # Assert that 4 slices are in the cake
        self.assertTrue(self.is_element_present(By.XPATH, "//div[@id='option6']/div[2]/span"))
        self.assertTrue(self.is_element_present(By.XPATH, "//div[@id='option6']/div[3]/span"))
        self.assertTrue(self.is_element_present(By.XPATH, "//div[@id='option6']/div[4]/span"))
        self.assertTrue(self.is_element_present(By.XPATH, "//div[@id='option6']/div[5]/span"))
        self.assertFalse(self.is_element_present(By.XPATH, "//div[@id='option6']/div[6]/span"))

    def test_random_actions_trying_to_break(self):
        print("\ntest_random_actions_trying_to_break:\n======================")
        driver = self.driver
        # Open up the website
        driver.get(self.base_url)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/0/n/n/n/n/n", driver.current_url)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        driver.find_element_by_id("menu-toggle").click()
        self.assertEqual(u"Gjöld, 2014", driver.find_element_by_css_selector("[id*=_title]").text)
        # Open the calendar
        driver.find_element_by_id("calendar-toggle").click()
        # Select february
        driver.find_element_by_id("month-dropdown").click()
        driver.find_element_by_link_text(u"febrúar").click()
        time.sleep(1)
        self.assertEqual(u"Gjöld, 2014 - febrúar", driver.find_element_by_css_selector("[id*=_title]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-02/0/n/n/n/n/n", driver.current_url)
        self.assertEqual("8.2%", driver.find_element_by_id("hfp-percentage").text)
        # Select third quarter
        driver.find_element_by_id("quarter-dropdown").click()
        driver.find_element_by_link_text(u"þriðji").click()
        time.sleep(1)
        self.assertEqual(u"Gjöld, 2014 - þriðji ársfjórðungur", driver.find_element_by_css_selector("[id*=_title]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-3/0/n/n/n/n/n", driver.current_url)
        self.assertEqual("22.7%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual("veldu", driver.find_element_by_id("month-dropdown").text)
        # Click on logo (go home)
        driver.find_element_by_id("main-title").click()
        # Deselect third quarter
        driver.find_element_by_id("quarter-dropdown").click()
        driver.find_element_by_link_text(u"veldu").click()
        time.sleep(1)
        self.assertEqual("veldu", driver.find_element_by_id("month-dropdown").text)
        self.assertEqual("veldu", driver.find_element_by_id("quarter-dropdown").text)
        self.assertEqual(u"Gjöld, 2014", driver.find_element_by_css_selector("[id*=_title]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/0/n/n/n/n/n", driver.current_url)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        driver.find_element_by_id("calendar-toggle").click()
        # Click slice "Velferðarmál" in sidebar
        driver.find_element_by_xpath("//div[@id='option0']/div[4]/span").click()
        time.sleep(1)
        self.assertEqual("11.0%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Velferðarmál", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/1/6/n/n/n/n", driver.current_url)
        # Click the same slice again
        driver.find_element_by_xpath("//div[@id='option0']/div[4]/span").click()
        time.sleep(1)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual("Allar deildir", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/1/n/n/n/n/n", driver.current_url)
        # Go straight to primary finance keys
        driver.find_element_by_id("option-text2").click()
        time.sleep(1)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual("Allar deildir", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/4/n/n/n/n/n", driver.current_url)
        # Click on slice "Vörukaup" in sidebar
        driver.find_element_by_xpath("//div[@id='option4']/div[6]/span").click()
        time.sleep(1)
        self.assertEqual("5.0%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Vörukaup", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/5/n/n/n/n/2000", driver.current_url)
        # Click on slice "Önnur vörukaup" in pe
        driver.find_element_by_css_selector("[id*=_segment2]").click()
        time.sleep(1)
        self.assertEqual("1.1%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual(u"Vörukaup > Önnur vörukaup", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/6/n/n/n/n/2900", driver.current_url)
        # Click on "Upphafsstilla" to reset the app
        driver.find_element_by_id("clear-filters").click()
        time.sleep(1)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual("Allar deildir", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        self.assertEqual("http://localhost:8000/#/expenses/2014-0/0/n/n/n/n/n", driver.current_url)
        # Change to joint-revenue
        driver.find_element_by_id("type-button").click()
        driver.find_element_by_link_text("Sameiginlegar tekjur").click()
        time.sleep(1)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual("kr. 18.529.125.975.-", driver.find_element_by_xpath("//div[@id='hfp-progress']/p").text)
        self.assertEqual(u"Útsvar", driver.find_element_by_css_selector("[id*=_segmentMainLabel0-outer]").text)
        self.assertEqual("Allar deildir", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        self.assertEqual("Sameiginlegar tekjur, 2014", driver.find_element_by_css_selector("[id*=_title]").text)
        self.assertEqual("http://localhost:8000/#/joint-revenue/2014-0/3/n/n/", driver.current_url)
        # Change to special-revenue
        driver.find_element_by_id("type-button").click()
        driver.find_element_by_link_text(u"Sértekjur").click()
        time.sleep(1)
        self.assertEqual("100.0%", driver.find_element_by_id("hfp-percentage").text)
        self.assertEqual("kr. 11.089.287.535.-", driver.find_element_by_xpath("//div[@id='hfp-progress']/p").text)
        self.assertEqual(u"Önnur mál", driver.find_element_by_css_selector("[id*=_segmentMainLabel0-outer]").text)
        self.assertEqual("Allar deildir", driver.find_element_by_css_selector("[id*=_subtitle]").text)
        self.assertEqual(u"Sértekjur, 2014", driver.find_element_by_css_selector("[id*=_title]").text)
        self.assertEqual("http://localhost:8000/#/special-revenue/2014-0/0/n/n/n/n/n", driver.current_url)
        # Open help function
        driver.find_element_by_id("instructions-toggle").click()
        self.assertTrue(driver.find_element_by_id("hfp-instructions").is_displayed())
        # Close help function
        driver.find_element_by_id("instructions-toggle").click()
        self.assertFalse(driver.find_element_by_id("hfp-instructions").is_displayed())

    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException as e: return False
        return True

    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException as e: return False
        return True

    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True

    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)
        self.display.stop()

if __name__ == "__main__":
    unittest.main()
