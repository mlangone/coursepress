/* global CoursePress,videojs */

(function() {
    'use strict';

    CoursePress.Define( 'Steps', function( $, doc ) {
        var Steps = {};

        Steps.toggleRetry = function( ev ) {
            var sender, answer_box, question_box;

            sender = $(ev.currentTarget);
            answer_box = sender.parents('.course-module-answer').first();
            question_box = answer_box.prev( '.course-module-step-question' );

            answer_box.slideUp();
            question_box.slideDown();
        };

		$('.video-js').each(function () {
			var mediaEl, media, attempts, allowedAttempts, stopIfAttemptsConsumed, stopIfAttemptsConsumedDeBounced, updateAttempts, updateAttemptsDeBounced, onTimeUpdate;

			mediaEl = $(this);
			attempts = mediaEl.data('attempts') || 0;
			allowedAttempts = mediaEl.data('allowedAttempts');
			media = videojs(mediaEl.get(0));
			stopIfAttemptsConsumed = function () {
				if (attempts >= allowedAttempts) {
					media.pause();
				}
				//win.console.log('Attempts: ' + attempts);
				//win.console.log('Allowed attempts: ' + allowedAttempts);
			};
			stopIfAttemptsConsumedDeBounced = _.debounce(stopIfAttemptsConsumed, 1000);
			updateAttempts = function (event) {
				var form, request, formValues = {};
				attempts++;
				form = $(event.target).closest('form');
				$.each(form.serializeArray(), function (i, field) {
					formValues[field.name] = field.value || '';
				});

				request = new CoursePress.Request();
				request.set(_.extend({'action': 'record_media_response'}, formValues));
				request.save();
				//win.console.log('Attempts updated to: ' + attempts);
			};
			updateAttemptsDeBounced = _.debounce(updateAttempts, 1000);
			onTimeUpdate = function (event) {
				if (parseInt(media.currentTime()) === 0) {
					stopIfAttemptsConsumedDeBounced(event);
				}

				if (parseInt(media.remainingTime()) === 0) {
					updateAttemptsDeBounced(event);
				}
			};

			media.on('play', stopIfAttemptsConsumed);
			if (media.loop()) {
				media.on('timeupdate', onTimeUpdate);
			}
			else {
				media.on('ended', updateAttempts);
			}
		});

        $(doc).on( 'click', '.cp-button-retry', Steps.toggleRetry );
    });
})();