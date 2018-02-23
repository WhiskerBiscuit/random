import React from 'react';

import LoadingSpinner from '../loading-spinners/LoadingSpinner/LoadingSpinner';

const connectToData = (WrappedComponent, { getData, onSuccess, onError, handleErrors }) => {
    return class extends React.Component {

        constructor(props) {
            super(props);
            this.state = {
                isLoading: true,
                data: {}
            };
        }

        componentDidMount() {

            // Get module data
            getData()
                .then((data) => {

                    // Check for and handle errors
                    if (data.errors || data.error) {
                        handleErrors(data.errors, onError);
                    }

                    // No errors
                    else {

                        // Update component with fresh data
                        this.setState({
                            isLoading: false,
                            data: onSuccess(data)
                        });
                    }
                })

                // Handle errors
                .catch((err) => {
                    handleErrors(err, onError);
                });
        }

        render() {

            // Wraps the input component in a container, without mutating it. Good!
            return (
                this.state.isLoading
                    ?
                <LoadingSpinner text="Retrieving Personalized Recommendations..." />
                    :
                <WrappedComponent {...this.state.data} {...this.props} />
            );
        }
    };
};

export default connectToData;
