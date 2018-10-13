import React, { Component } from 'react';
import './Section.css';

class Info extends Component {
  render() {
    const { title, sectionTitle, bugs, pr } = this.props;
    return (
      <div className="container">
        <h3 className="section-title">{sectionTitle}</h3>
        <div className="row">
          <p className="row__title">{title}</p>
          <p className="row__content">{bugs}</p>
        </div>
        <div className="row">
          <p className="row__subtitle">Has possible fixing PR:</p>
          <p className="row__content">{pr}</p>
        </div>
      </div>
    );
  }
}

export default Info;
