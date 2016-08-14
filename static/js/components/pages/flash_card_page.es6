
let {PropTypes: types} = React
let {Link} = ReactRouter

class FlashCardPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      cardNumber: 0,
      enabledRoots: { "D": true },
    }
    this.rand = new MersenneTwister()
  }

  componentWillMount() {
    this.setupNext()
  }

  componentDidMount() {
    this.upListener = event => {
      let key = keyCodeToChar(event.keyCode)
      if (key == null) {
        return
      }

      if (key.match(/^\d$/)) {
        let option = (+key) - 1
        let button = this.refs.cardOptions.children[option]
        if (button) {
          button.click()
        }
      } else {
        for (let button of this.refs.cardOptions.children) {
          if (button.textContent == key.toUpperCase()) {
            button.click()
          }
        }
      }

    }
    window.addEventListener("keyup", this.upListener)
  }

  componentWillUnmount() {
    window.removeEventListener("keyup", this.upListener)
  }

  setupNext() {
    let notes = ["C", "D", "E", "F", "G", "A", "B"]
    let offsets = [1,2,3,4,5,6]

    let rootIdx = 1
    let note = notes[rootIdx] // hard code to C for now
    let offset = offsets[this.rand.int() % offsets.length]
    let answer = notes[(rootIdx + offset) % notes.length]

    if (this.state.currentCard && answer == this.state.currentCard.answer) {
      // no repeats
      return this.setupNext()
    }

    this.setState({
      cardNumber: this.state.cardNumber + 1,
      currentCard: {
        type: "midi",
        label: `${offset + 1} of ${note} is`,
        answer: answer,
        options: notes,
      }
    })
  }

  checkAnswer(answer) {
    if (!this.state.currentCard) {
      return
    }

    if (answer == this.state.currentCard.answer) {
      this.setupNext()
    } else {
      let card = this.state.currentCard
      let cardNumber = this.state.cardNumber

      card.chosen = card.chosen || {}
      card.chosen[answer] = true

      this.setState({ cardError: true })

      window.setTimeout(() => {
        if (this.state.cardNumber == cardNumber) {
          this.setState({ cardError: false })
        }
      }, 600)
    }
  }

  render() {
    return <div className="flash_card_page">
      {this.renderTestGroups()}
      {this.renderCurrentCard()}
    </div>
  }

  renderTestGroups() {
    let notes = ["C", "D", "E", "F", "G", "A", "B"]

    return <div className="test_groups">
      {notes.map((note) => <div className={classNames("test_group", {selected: this.state.enabledRoots[note]})}>
          <label>
            <input
              type="checkbox"
              checked={this.state.enabledRoots[note] || false}
              onChange={(e) => {
                this.state.enabledRoots[note] = !this.state.enabledRoots[note]
                this.forceUpdate()
              }}
              />
            {note}
          </label>
        </div>
      )}
    </div>
  }

  renderCurrentCard() {
    if (!this.state.currentCard) {
      return;
    }

    let card = this.state.currentCard

    let options = card.options.map(a => 
      <button
        key={a}
        disabled={card.chosen && card.chosen[a]}
        onClick={(e) => {
          e.preventDefault()
          this.checkAnswer(a)
        }}
      >{a}</button>
    )

    return <div className="card_holder">
      <div className={classNames("flash_card", {errorshake: this.state.cardError})}>
        {card.label}
      </div>
      <div className="card_options" ref="cardOptions">{options}</div>
    </div>
  }
}
