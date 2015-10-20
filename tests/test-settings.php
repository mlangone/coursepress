<?php

class CoursePress_Settings_Tests extends WP_UnitTestCase {


	// Make sure our Settings Page has all the correct tabs
	function test_settings_array_keys() {

		/** Initialise the hooks we need for the tests */
		$this->add_test_hooks();

		/**
		 * Get the tabs. The `coursepress_tabs_coursepress_settings` hook is used in the test
		 * to add some extra tabs for testing purposes.
		 */
		$tabs = CoursePress_View_Admin_Settings::get_tabs();

		/**
		 * Test hooks for adding additional tabs. If this assertion fails, the filter is not working.
		 */
		$this->assertArrayHasKey( 'test_tab', $tabs );

		/**
		 * Test tab ordering. Allows inserting tabs at given locations. The default tabs will be added
		 * at intervals of 10, so custom tabs can be added in between.
		 */
		$expected = array(
			'general',
			'tab3',
			'tab2',
			'tab1',
			'test_tab',
		);

		$actual = array_keys( $tabs );

		//print_r( $actual);
		$this->assertEquals( $expected, $actual );

		/** Test default tabs for Settings page */
		// Contains 'general' settings
		$this->assertArrayHasKey( 'general', $tabs );

	}

	// Make sure we can get and set the settings
	function test_settings_get_and_set() {

		/**
		 * Test setting options
		 */
		$this->assertTrue( CoursePress_Core::update_network_setting( 'test_network_setting', 'network test' ) );
		$this->assertTrue( CoursePress_Core::update_setting( 'test_setting', 'test' ) );
		$this->assertTrue( CoursePress_Core::update_setting( 'level1/level2/level3', 'nesting' ) );
		$this->assertTrue( CoursePress_Core::update_setting( 'level1/key1', false ) );

		/**
		 * Test getting options
		 */
		$this->assertEquals( 'network test', CoursePress_Core::get_network_setting( 'test_network_setting' ) );
		$this->assertEquals( 'test', CoursePress_Core::get_setting( 'test_setting' ) );
		$this->assertEquals( 'nesting', CoursePress_Core::get_setting( 'level1/level2/level3' ) );
		$expected = array( 'level3' => 'nesting' );
		$this->assertEquals( $expected, CoursePress_Core::get_setting( 'level1/level2' ) );

		/**
		 * Test empty or false options
		 */
		$this->assertEquals( null, CoursePress_Core::get_setting( 'level1/level2/level3/level4' ) );
		$this->assertNotEquals( true, CoursePress_Core::get_setting( 'level1/key1' ) );

		/**
		 * Test default values
		 */
		$this->assertEquals( 'default network', CoursePress_Core::get_network_setting( 'level1/level2/level3/level4', 'default network' ) );
		$this->assertEquals( 'default', CoursePress_Core::get_setting( 'level1/level2/level3/level4', 'default' ) );

		/**
		 * Test to see if get_network_setting() reverts to value of get_setting()
		 * Only if not on a multisite network
		 */
		if( ! is_multisite() ) {
			$this->assertEquals( 'test', CoursePress_Core::get_network_setting( 'test_setting' ) );
		}

	}

	/**
	 * ============================================================================================
	 * BELOW THIS LINE ARE ALL THE UTILITIES WE NEED TO SIMULATE CODE THAT COULD BE LOADED
	 *
	 * e.g. Adding hooks
	 * ============================================================================================
	 */

	// Add hooks that might be added by other plugins or within CoursePress itself
	function add_test_hooks() {

		// Add filter to add additional test tabs to Settings page
		add_filter( 'coursepress_settings_tabs', array( get_class(), 'add_tabs_test' ) );
	}


	// Add a test tab
	public static function add_tabs_test( $tabs ) {

		// Reset to essential tabs
		$essential_tabs = array( 'general' );

		foreach( $tabs as $key => $tab ) {
			if( ! in_array( $key, $essential_tabs ) ) {
				unset( $tabs[ $key ] );
			}
		}

		// Add test tabs
		$test_tabs = array(
			'test_tab' => array(
				'title' => __( 'Test Tabs', CoursePress::TD ),
				'description' => __( 'This is the description of what you can do on this page.', CoursePress::TD ),
			),
			'tab1' => array(
				'title' => 'Test Tab 1',
				'description' => 'Third tab really.',
				'order' => 4,
			),
			'tab2' => array(
				'title' => 'Test Tab 1',
				'description' => 'Third tab really.',
				'order' => 3,
			),
			'tab3' => array(
				'title' => 'Test Tab 1',
				'description' => 'Third tab really.',
				'order' => 2,
			),
		);

		$tabs = array_merge( $tabs, $test_tabs );

		return $tabs;
	}


}
