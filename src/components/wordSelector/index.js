import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  View,
  Text,
  Button,
} from 'react-native';
import PropTypes from 'prop-types';

export default class WordSelector extends Component {
  state = {
    selectedWordIdx: -1,
    wordList: null,
  };

  componentDidMount() {
    let wordList = [];

    // Break down all the words detected by the camera
    if (
      this.props.wordBlock &&
      this.props.wordBlock.textBlocks &&
      this.props.wordBlock.textBlocks.length > 0
    ) {
      for (let idx = 0; idx < this.props.wordBlock.textBlocks.length; idx++) {
        let text = this.props.wordBlock.textBlocks[idx].value;
        if (text && text.trim().length > 0) {
          let words = text.split(/[\s,.?]+/);
          if (words && words.length > 0) {
            for (let idx2 = 0; idx2 < words.length; idx2++) {
              if (words[idx2].length > 0) wordList.push(words[idx2]);
            }
          }
        }
      }

      this.setState({wordList: wordList});
    }
  }

  // Pupulate the words UI for the user to select
  populateWords() {
    const wordViews = [];

    if (this.state.wordList && this.state.wordList.length > 0) {
      for (let idx = 0; idx < this.state.wordList.length; idx++) {
        wordViews.push(
          <TouchableHighlight
            key={'Word_' + idx}
            underlayColor={'#d6f9ff'}
            onPress={() => {
              this.setState({selectedWordIdx: idx});
            }}
            style={
              this.state.selectedWordIdx == idx
                ? styles.selectedWord
                : styles.nonSelectedWord
            }>
            <Text style={styles.word}>{this.state.wordList[idx]}</Text>
          </TouchableHighlight>,
        );
      }
    }

    return wordViews;
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Please select a word below and click on the Ok button.
          </Text>
        </View>
        <ScrollView>
          <View style={styles.wordList}>{this.populateWords()}</View>
        </ScrollView>
        <Button
          title="OK"
          disabled={
            !(
              this.state.selectedWordIdx >= 0 &&
              this.state.wordList &&
              this.state.wordList.length > this.state.selectedWordIdx
            )
          }
          onPress={() => {
            this.props.onWordSelected &&
              this.props.onWordSelected(
                this.state.wordList[this.state.selectedWordIdx],
              );
          }}
        />
        <View style={{minHeight: 30}}></View>
      </View>
    );
  }
}

WordSelector.propTypes = {
  wordBlock: PropTypes.object,
  onWordSelected: PropTypes.func,
};

WordSelector.defaultProps = {
  wordBlock: null,
  onWordSelected: null,
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  header: {
    padding: 4,
  },
  headerText: {
    fontSize: 20,
  },
  wordList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  selectedWord: {
    flex: 0,
    borderWidth: 1,
    borderColor: 'blue',
    backgroundColor: '#d6f9ff',
    padding: 4,
  },
  nonSelectedWord: {
    flex: 0,
    borderWidth: 0,
    padding: 4,
  },
  word: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  okButton: {
    marginBottom: 50,
    fontSize: 30,
  },
});
