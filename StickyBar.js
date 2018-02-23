import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export default class StickyBar extends React.Component {

    constructor(props) {
        super(props);
        this.onScroll = this.onScroll.bind(this);
        this.onOrientationChange = this.onOrientationChange.bind(this);
        this.sizeAndUpdateDockPosition = this.sizeAndUpdateDockPosition.bind(this);
        this.updateInitialPosition = this.updateInitialPosition.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    onScroll() {

        // Set stickiness class
        const stickyClass = 'is-sticky';

        // Get baseline position
        const documentTop = document.documentElement.scrollTop || document.body.scrollTop;
        const documentBottom = document.documentElement.scrollHeight || document.body.scrollHeight;

        // Get viewport bottom
        const viewportBottom = window.innerHeight + window.scrollY;

        // Set sticky position coordinates
        const stickyInitial = parseInt(this.sticky.getAttribute('data-sticky-initial'), 10);
        const stickyEnter = parseInt(this.sticky.getAttribute('data-sticky-enter'), 10) || stickyInitial;
        const stickyExit = parseInt(this.sticky.getAttribute('data-sticky-exit'), 10) || (this.props.stickyPosition === 'top' ? documentBottom : documentTop);

        if (this.props.stickyPosition === 'top') {
            if (documentTop >= stickyEnter && documentTop <= stickyExit) {
                this.sticky.classList.add(stickyClass);
            } else {
                this.sticky.classList.remove(stickyClass);
            }
        }

        // stickyPosition === bottom
        else {
            if (viewportBottom <= stickyEnter && viewportBottom >= stickyExit) {
                this.sticky.classList.add(stickyClass);
            } else {
                this.sticky.classList.remove(stickyClass);
            }
        }
    }

    // Listen for resize changes
    onOrientationChange() {

        // Remove stickiness
        this.sticky.classList.remove('is-sticky');

        // Remove placeholder dimensions
        this.stickyBar.setAttribute('style', '');

        // Update position and sizes
        this.sizeAndUpdateDockPosition();

        // Force check sticky state in case element is in a position to be sticky
        this.onScroll();
    }

    // Set sticky bar size and initial position
    sizeAndUpdateDockPosition() {
        // Get baseline position
        const bodyRect = document.body.getBoundingClientRect();

        // Get sticky position
        const stickyRect = this.sticky.getBoundingClientRect();

        // Calculate sticky coordinates
        const stickyTop = stickyRect.top - bodyRect.top;
        const stickyBottom = stickyRect.bottom - bodyRect.top;
        const stickyHeight = stickyBottom - stickyTop;
        const stickyWidth = stickyRect.right - stickyRect.left;

        // Determine initial position
        const initial = this.props.stickyPosition === 'top' ? stickyTop : stickyBottom;

        // Set initial position
        this.sticky.setAttribute('data-sticky-initial', initial.toString());

        // Size the sticky placeholder to prevent DOM collapse
        this.stickyBar.setAttribute('style', 'width: ' + stickyWidth + 'px; height: ' + stickyHeight + 'px;');
    }

    updateInitialPosition() {

        // Get baseline position
        const bodyRect = document.body.getBoundingClientRect();

        // Get placeholder position
        const stickyBarRect = this.stickyBar.getBoundingClientRect();

        // Calculate placeholder coordinates
        const stickyBarTop = stickyBarRect.top - bodyRect.top;
        const stickyBarBottom = stickyBarRect.bottom - bodyRect.top;

        // Determine initial position
        const initial = this.props.stickyPosition === 'top' ? stickyBarTop : stickyBarBottom;

        // Update sticky position
        this.sticky.setAttribute('data-sticky-initial', initial.toString());
    }

    // Remove event listeners
    destroy() {
        document.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onOrientationChange);
        this.sticky.classList.remove('is-sticky');
    }

    componentDidMount() {

        // Allow docking when required
        if (this.props.dock) {

            // Force element position updates on initialization
            this.sizeAndUpdateDockPosition();

            // Force check sticky state on initialization in case element is in a position to be sticky
            this.onScroll();

            // Add event listeners
            document.addEventListener('scroll', this.onScroll);
            window.addEventListener('resize', this.onOrientationChange);
        }

        else {

            this.sticky.classList.add('is-sticky');
        }
    }

    componentWillUnmount() {

        // Remove event listeners
        this.destroy();
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.forceUpdate;
    }

    componentDidUpdate() {

        // Force element position updates
        this.updateInitialPosition();

        // Force check sticky state on initialization in case element is in a position to be sticky
        this.onScroll();
    }

    render() {
        const { className, enter, exit, stickyPosition = 'bottom', children } = this.props;
        const componentClass = 'c-sticky-bar';
        const componentClasses = classNames(componentClass, className);
        const stickyClass = 'c-sticky';
        const stickyClasses = classNames(stickyClass, `is-sticky-${stickyPosition}`);
        return (
            <div className={componentClasses} ref={(stickyBar)=>{this.stickyBar = stickyBar;}}>
                <div
                    ref={(sticky)=>{this.sticky = sticky;}}
                    className={stickyClasses}
                    data-sticky
                    data-sticky-enter={enter}
                    data-sticky-exit={exit}
                >
                    {children}
                </div>
            </div>
        );
    }
}

StickyBar.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    enter: PropTypes.string,
    exit: PropTypes.string,
    stickyPosition: PropTypes.oneOf(['top', 'bottom']),
    forceUpdate: PropTypes.bool,
    dock: PropTypes.bool
};

StickyBar.defaultProps = {
    stickyPosition: 'bottom',
    dock: true
};

// module.exports = StickyBar;
