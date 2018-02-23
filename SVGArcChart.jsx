import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
// import Snap from 'snapsvg';

export default class SVGArcChart extends React.Component {

    constructor(props) {
        super(props);
        this.createMask = this.createMask.bind(this);
        this.createSegments = this.createSegments.bind(this);
    }

    componentDidMount() {

        // Get the percentage to uncover
        const percentFull = parseInt(this.props.percentFull || 0);

        // Get the percentage text node
        let percentage = this.svgArcChart.querySelector('.c-svg-arc-chart__percentage');

        // Animate the mask to uncover the background, not going over 100%
        this.animateDashArray(((percentFull > 100 ? 100 : percentFull) / 100), this.svgArcChart, percentage);
    }

    animateDashArray(ratio, svg, percentage) {

        // Get the masking element
        let mask = svg.querySelector('.c-svg-arc-chart__mask');

        // Set default visible arc in degrees of a circle (360)
        const visibleArcDegrees = 240;
        const visibleArcPercent = visibleArcDegrees / 360 * 100;

        if (typeof Snap !== 'undefined') {

            // Animate the 'uncovering' of the gauge and increment the percentage accordingly
            // 1st param: start at this angle
            return Snap.animate(visibleArcPercent, (visibleArcPercent * (1 - ratio)), ((val) => {

                // Update the masking element stoke dash array attribute to 'uncover' the arc behind
                mask.setAttribute('stroke-dasharray', val + `, 100`);

                // Update the percentage text node to the current percent uncovered
                percentage.textContent = (100 - (Math.round((val / visibleArcPercent) * 100)));
            }), Math.round(2000 * ratio), mina.easeinout);
        }

        else {

            // Update the masking element stoke dash array attribute to 'uncover' the arc behind
            mask.setAttribute('stroke-dasharray', (visibleArcPercent * (1 - ratio)) + `, 100`);

            // Update the percentage text node to the current percent uncovered
            percentage.textContent = (100 - (Math.round(((visibleArcPercent * (1 - ratio)) / visibleArcPercent) * 100)));
        }
    }

    createMask(cx, cy, radius, strokeWidth, stroke, visibleArcPercent, circumference) {

        // Fill the mask completely using the stroke dash array
        // 1st stroke: size of mask arc
        // 2nd stroke: used to push all other strokes off of the mask
        //      keep same size as mask arc to keep a usable percent of 100
        //      as it seems to correlate
        const maskStrokeDashArray = `${visibleArcPercent} ${circumference}`;

        // The background segments bleed through on the edge if exactly the same width
        // so we add a little bit to cover the bleed
        const maskStrokeWidth = strokeWidth * 1.02;

        // Create mask path
        // return <path {...maskProps} stroke="#eee" fill="none" />;
        return <circle key="mask" className="c-svg-arc-chart__mask" cx={cx} cy={cy} r={radius} stroke={stroke} strokeDasharray={maskStrokeDashArray} strokeWidth={maskStrokeWidth} fill="none" transform={`rotate(-30 ${cx} ${cy})`} />;
    }

    createSegments(cx, cy, radius, strokeWidth, visibleArcPercent, circumference, percentFull) {

        // Begin mask creation
        // Fill the mask completely using the stroke dash array
        // 1st stroke: size of mask arc
        // 2nd stroke: used to push all other strokes off of the mask
        //      keep same size as mask arc to keep a usable percent of 100
        //      as it seems to correlate
        const segmentStrokeDashArray = `${visibleArcPercent} ${circumference}`;

        // Begin background segment creation
        // Keep a count of the % position used by each segment as it is added to the background arc
        let segmentStartDegrees = 0;
        let tickColor = '#000';

        // Define the segments (percent: how much of the 'gauge' or visible arch each segment covers)
        const segments = [
            {percent: 10, color: '#d15050'},
            {percent: 15, color: '#f6a623'},
            {percent: 25, color: '#fc0'},
            {percent: 30, color: '#1aba9c'},
            {percent: 20, color: '#277667'}
        ];

        // Return array of background segments
        const segs = segments.map((segment) => {

            // Get the % of the visible arc that the segment covers
            const segmentLengthDegrees = (segment.percent / 100) * visibleArcPercent;

            // Return segment path
            const circle = <circle key={segmentStartDegrees} className="c-svg-arc-chart__segment" cx={cx} cy={cy} r={radius} stroke={segment.color} strokeDasharray={segmentStrokeDashArray} strokeDashoffset={segmentStartDegrees} strokeWidth={strokeWidth} fill="none" transform={`rotate(150 ${cx} ${cy})`} />;

            // Update tick color based on percent full falling withing segment range
            tickColor = percentFull >= (segmentStartDegrees / visibleArcPercent * 100) ? segment.color : tickColor;

            // Update where the next segment will start
            segmentStartDegrees += segmentLengthDegrees;

            // Return background segment
            return circle;
        });

        // Get the fill radius to cover the inner part of the 'tick'
        const tickWidth = visibleArcPercent / circumference / 2;
        const tickPosition = -visibleArcPercent * ((100 - percentFull) / 100);
        const fillRadius = radius - (strokeWidth / 2);

        const tick = <circle key="tick" className="c-svg-arc-chart__tick" cx={cx} cy={cy} r={radius} stroke={tickColor} strokeDasharray={`${tickWidth} ${circumference}`} strokeDashoffset={tickPosition} strokeWidth={strokeWidth + 1} fill="none" transform={`rotate(150 ${cx} ${cy})`}/>;
        const fill = <circle key="fill" className="c-svg-arc-chart__fill" cx={cx} cy={cy} r={fillRadius} fill="#fff"/>;

        return [...segs, tick, fill];
    }

    render() {
        const { className, percentFull } = this.props;
        const componentClass = 'c-svg-arc-chart';
        const componentClasses = classNames(componentClass, className);
        const componentProps = { className: componentClasses };

        // Ensure a valid percent value
        let cleanPercentFull = Math.abs(parseInt(percentFull || 0));
        if (cleanPercentFull > 100) cleanPercentFull = 100;

        // Base radial units off of 100%
        // This will allow dash arrays to be represented as a % of a full circle
        // Since we are showing a subset of a full circle
        // we use the percentage of the subset, in this case 240 of 360 degrees
        // which is 66% of the whole and 100% of the full visible arc
        const circumference = 100;
        const radius = circumference / (Math.PI * 2);

        // Set default stroke width
        const strokeWidth = 2;

        // Create an SVG viewport base size with some padding to account for stroke widths
        const padPercent = strokeWidth * 2;
        const width = (radius * 2) + padPercent;
        const height = (radius * 2) + padPercent;

        // Get the center of the SVG viewport
        const cx = width / 2;
        const cy = height / 2;

        // Set default visible arc in degrees of a circle (360)
        const visibleArcDegrees = 240;
        const visibleArcPercent = visibleArcDegrees / 360 * circumference;

        // Set SVG props
        const svgProps = { className: 'c-svg-arc-chart__svg', viewBox: `0 0 ${width} ${height * 0.75}`, width: '100%', height: '100%' };

        return (
            <div {...componentProps} ref={(svgArcChart) => {this.svgArcChart = svgArcChart;}}>
                <svg {...svgProps}>
                    <g transform={`translate(${height} 0) scale(-1 1)`}>
                        {this.createSegments(cx, cy, radius, strokeWidth, visibleArcPercent, circumference, cleanPercentFull)}
                    </g>
                    <g transform={`translate(0 ${height}) scale(1 -1)`}>
                        {this.createMask(cx, cy, radius, strokeWidth, '#eee', visibleArcPercent * ((100 - cleanPercentFull) / 100), circumference)}
                    </g>
                    <text className="c-svg-arc-chart__percentage" x={cx} y={cy} textAnchor="middle" fontSize="8" fill="#333">0</text>
                    <text className="c-svg-arc-chart__text" x={cx} y="95%" textAnchor="middle" fontSize="4" fill="#999">out of 100</text>
                </svg>
            </div>
        );
    }
}

SVGArcChart.propTypes = {
    className: PropTypes.string,
    percentFull: PropTypes.number.isRequired
};

SVGArcChart.defaultProps = {};

module.exports = SVGArcChart;