<?php
/**
 * Class CoursePress_Reports
 *
 * @since 3.0
 * @package CoursePress
 */
class CoursePress_Admin_Reports extends CoursePress_Admin_Page {
	/**
	 * @var string the main menu slug.
	 */
	protected $slug = 'coursepress_reports';
	private $course_id;
	private $students;

	public function __construct() {
		add_filter( 'coursepress_admin_localize_array', array( $this, 'add_i18n_messages' ) );
	}

	function columns() {
		$columns = array(
			'ID' => __( 'ID', 'cp' ),
			'student' => __( 'Student Name', 'cp' ),
			'responses' => __( 'Responses', 'cp' ),
			'average' => __( 'Average', 'cp' ),
			'download' => __( 'Download', 'cp' ),
			'view' => __( 'View', 'cp' ),
		);

		return $columns;
	}

	public function get_bulk_actions() {
		$actions = array(
			'download' => __( 'Download', 'cp' ),
			'download_summary' => __( 'Download Summary', 'cp' ),
			'show' => __( 'Show', 'cp' ),
			'show_summary' => __( 'Show Summary', 'cp' ),
		);
		return $actions;
	}

	/**
	 * Columns to be hidden by default.
	 *
	 * @return array
	 */
	function hidden_columns() {
		return array();
	}

	/**
	 * Custom screen options for course listing page.
	 */
	function process_page() {
		$screen_id = get_current_screen()->id;
		add_filter( 'default_hidden_columns', array( $this, 'hidden_columns' ) );
		add_filter( 'manage_' . $screen_id . '_columns', array( $this, 'columns' ) );
		// Courses per page.
		add_screen_option( 'per_page', array( 'default' => 20, 'option' => 'coursepress_reports_per_page' ) );
	}

	public function get_page() {
		$course_id = filter_input( INPUT_GET, 'course_id', FILTER_VALIDATE_INT );
		$this->course_id = $course_id;
		$mode = filter_input( INPUT_GET, 'mode' );
		$nonce = filter_input( INPUT_GET, '_wpnonce' );
		if ( $course_id && 'html' == $mode ) {
			if ( wp_verify_nonce( $nonce, 'coursepress_preview_report' ) ) {
				$student_id = filter_input( INPUT_GET, 'student_id', FILTER_VALIDATE_INT );
				$this->students = array( $student_id );
				$this->get_page_preview();
			} else if ( isset( $_GET['students'] ) && isset( $_GET['action'] ) ) {
				$this->students = array_filter( explode( ',', $_GET['students'] ), 'intval' );
				switch ( $_GET['action'] ) {

					case 'show':
						$this->get_page_preview();
					break;

					case 'show_summary':
						$this->get_page_preview( true, 'summary' );
					break;

					default:
						coursepress_render( 'views/admin/error-wrong', array( 'title' => __( 'Reports' ) ) );
				}
			} else {
				coursepress_render( 'views/admin/error-wrong', array( 'title' => __( 'Reports' ) ) );
			}
		} else {
			$this->get_page_list();
		}
		coursepress_render( 'views/admin/footer-text' );
	}

	private function get_page_list() {
		global $CoursePress_User;
		$this->list = new CoursePress_Admin_Table_Reports();
		add_filter( 'set-screen-option', array( $this, 'set_options' ), 10, 3 );
		$this->list->prepare_items();
		$count = $this->list->get_count();
		$courses = coursepress_get_accessible_courses();

		if ( empty( $_REQUEST['course_id'] ) && ! empty( $courses ) ) {
			$tmp = array_keys( $courses );
			$this->course_id = array_shift( $tmp );
		} else {
			$this->course_id = (int) $_REQUEST['course_id'];
		}

		$args = array(
			'columns' => $this->columns(),
			'courses' => $courses,
			'hidden_columns' => $this->hidden_columns(),
			'items' => $this->list->items,
			'page' => $this->slug,
			'pagination' => $this->set_courses_pagination( $count ),
			'download_nonce' => wp_create_nonce( 'coursepress_download_report' ),
			'current' => $this->course_id,
			'bulk_actions' => $this->get_bulk_actions(),
		);
		coursepress_render( 'views/admin/reports', $args );
	}

	private function get_page_preview( $echo = true, $mode = 'full' ) {
		$sufix = 'summary' == $mode? 'summary':'full';
		$course = coursepress_get_course( $this->course_id );
		/**
		 * Units
		 */
		$units = $course->get_units( false );
		$u = array();
		foreach ( $units as $unit ) {
			$unit->get_unit_structure();
			$unit->settings = $unit->get_settings();
			$unit->steps = $unit->get_steps();
			$u[] = $unit;
		}
		$content = '';
		$students = array();
		/**
		 * Students
		 */
		foreach ( $this->students as $student_id ) {
			$student = coursepress_get_user( $student_id );
			if ( $student->is_error ) {
				$args = array(
					'page' => $this->slug,
					'colors' => $this->get_colors(),
					'course' => $course,
					'units' => $u,
				);
				$content = coursepress_render( 'views/admin/error-wrong', array(), false );
				continue;
			}
			$students[] = $student;
			$student->progress = $student->get_completion_data( $this->course_id );
			$args = array(
				'page' => $this->slug,
				'colors' => $this->get_colors(),
				'course' => $course,
				'units' => $u,
				'student' => $student,
			);
			$content .= coursepress_render( 'views/admin/reports/single-'.$sufix, $args, false );
		}
		$args['content'] = $content;
		$args['students'] = $students;
		$content .= coursepress_render( 'views/admin/reports/preview-'.$sufix, $args, $echo );
		if ( ! $echo ) {
			return $content;
		}
	}

	private function get_colors() {
		$colors = apply_filters(
			'coursepress_report_colors',
			array(
				'title_bg' => '#0091cd',
				'title' => '#ffffff',
				'unit_bg' => '#f5f5f5',
				'unit' => '#000000',
				'no_items' => '#858585',
				'item_bg' => '#ffffff',
				'item' => '#000000',
				'item_line' => '#f5f5f5',
				'footer_bg' => '#0091cd',
				'footer' => '#ffffff',
				'row_even_bg' => '#fdfdf0',
				'row_odd_bg' => '#fff',
			)
		);
		return $colors;
	}

	public function get_pdf_content( $request ) {
		$this->course_id = $request->course_id;
		$this->student_id = $request->student_id;
		$filename = sprintf( 'coursepress_reports_%d_%d.pdf', $this->course_id, $this->student_id );
		// Set PDF args
		$pdf_args = array(
			'title' => __( 'CoursePress Reports', 'CP_TD' ),
			'orientation' => 'P',
			'filename' => $filename,
			'format' => 'F',
			'uid' => crc32( rand() ),
		);
		$args = array(
			'content' => $this->get_page_preview( false ),
			'filename' => $filename,
			'args' => $pdf_args,
		);
		return $args;
	}


	public function add_i18n_messages( $data ) {
		$data['text']['reports'] = array(
			'no_items' => __( 'Select students to generate the report!', 'cp' ),
			'no_action' => __( 'Select action to generate the report!', 'cp' ),
		);
		return $data;
	}
}
