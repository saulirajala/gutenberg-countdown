import React, { Component } from "react";
import "./App.css";
import Section from "./components/Section";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      issueNumbers: [],
      pullRequests: [],
      bugs: null
    };
    this.dataGen = null;
  }

  ajax(url) {
    fetch(url)
      .then(data => data.json())
      .then(data => this.dataGen.next(data))
      .catch(error => {
        console.error("error");
        this.setState({
          isLoaded: true,
          error
        });
      });
  }

  /**
   * GitHub Api only returns max 100 items as an result,
   * so we need to do paged fetch requests until empty array is returned
   * 1) Save count of issues to state
   * 2) Save issue numbers to state
   */
  *getIssues() {
    let issueNumbers = [];
    let i = 1;
    while (true) {
      const data = yield this.ajax(
        `https://api.github.com/repos/wordpress/gutenberg/issues?milestone=37&state=open&per_page=2&page=${i}`
      );
      // Break loop if ret value is empty array
      console.log(data);
      if (!data || data.length === 0) {
        break;
      }

      issueNumbers = issueNumbers.concat(
        data.map(async item => {
          const hasPullRequest = await this.hasPullRequest(item.number);
          return {
            number: item.number,
            hasPullRequest: hasPullRequest
          };
        })
      );
      i++;
    }

    this.setState({
      isLoaded: true,
      issueNumbers: issueNumbers,
      pullRequests: issueNumbers.filter(item => item.hasPullRequest)
    });
  }

  /**
   * Check if issue has Pull Request
   *
   * How the check is made?
   * - Do search-request to GitHub Api: https://api.github.com/search/issues?q=${item}+repo:wordpress/gutenberg
   * - If only 1 search result => no pull request for item
   * - If more than one search results => results are either other issues or pull requests
   * - If at least one result has pull_request -key => issue has maybe fixing pull request
   *
   * Please note:
   * This method still leaves the possibility open that issue doesn't actually have maybe fixing pull request.
   * The issue can be referenced for other reasons. For example:
   *    Comment 1: "Will this fix also #9680?"
   *    Comment 2; "No, it won't"
   *
   * This is the downside that we need to accept. AFAIK this is the only way to see, if there is pull request related to issue
   *
   * TODO: This will not work since there is rate limit in GitHub api.
   * Even for authenticated client can send only 30 requests per minute to Search API.
   * With more than 100 issues, it would take minutes and nobody has time for that!
   * https://developer.github.com/v3/search/#rate-limit
   *
   * Otherwise request limit is 5000 request per hour for authenticated client. For non-authenticated client 60 per hour.
   * https://developer.github.com/v3/#rate-limiting
   *
   * @param {*} item
   */
  hasPullRequest(item) {
    return new Promise((resolve, reject) => {
      if (false) {
        reject("Noop");
      }
      fetch(
        `https://api.github.com/search/issues?q=${item}+repo:wordpress/gutenberg`
      )
        .then(data => data.json())
        .then(data => {
          if (data.items.length <= 1) {
            resolve(false);
          }
          resolve(true);
        })
        .catch(error => {
          console.error(error);
          this.setState({
            isLoaded: true,
            error
          });
        });
    });
  }

  componentDidMount() {
    this.dataGen = this.getIssues();
    this.dataGen.next();
  }

  render() {
    const { issueNumbers, pullRequests, isLoaded, error } = this.state;
    let placeholderText = "Loading…";
    if (error) {
      placeholderText = "Error happened";
    }
    return (
      <div className="App">
        <h1>Gutenberg countdown</h1>
        <Section
          sectionTitle="WordPress 5.0 milestone"
          title="Issues:"
          pr={isLoaded && !error ? pullRequests.length : placeholderText}
          bugs={isLoaded && !error ? issueNumbers.length : placeholderText}
        />
      </div>
    );
  }
}

export default App;
