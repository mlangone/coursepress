/* global CoursePress */

(function() {
    'use strict';

    CoursePress.Define( 'Step_AUDIO', function() {
        return CoursePress.View.extend({
            template_id: 'coursepress-step-audio',
            events: {
                'change [name="meta_allow_retries"]': 'toggleGreyBox',
                'change [name]': 'updateModel'
            },
            initialize: function( model, stepView ) {
                this.stepView = stepView;
                this.on( 'view_rendered', this.setUI, this );
                this.render();
            },

            setUI: function() {
                this.audio_source = new CoursePress.AddMedia(this.$('.cp-add-audio'));
            },

            toggleGreyBox: function(ev) {
                this.stepView.toggleGreyBox(ev);
            },

            updateModel: function(ev) {
                this.stepView.updateModel(ev);
            }
        });
    });
})();