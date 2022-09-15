import { Component } from "react";

export default class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      returnedData: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState((prevState) => {
      return {
        [e.target.name]: e.target.value,
      };
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const id = this.state.id; //TODO: use user session ID instead of form entered ID
    fetch(`http://localhost:8080/messages/${id}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.setState((prevState) => {
          return {
            returnedData: [...prevState.returnedData, ...data],
          };
        });
        console.info(this.state);
      })
      .catch((err) => console.error(err));
    //call backend with the given parametersLimit
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            name="id"
            type="text"
            onChange={this.handleChange}
            value={this.state.id}
            placeholder="Search with ID"
          ></input>
          <button>Search</button>
        </form>

        <ul className="results-list">
          {this.state.returnedData.map((dataElement) => {
            return (
              <li>
                <div>
                  <h2>Data Item</h2>
                  <p>{dataElement.message}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
