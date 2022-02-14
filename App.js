import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Api from './src/lib/api';
import Helper from './src/lib/helper';
import WordDefinition from './src/components/wordDef';
import Camera, {Constants} from './src/components/camera';
import WordSelector from './src/components/wordSelector';
import Icon from 'react-native-vector-icons/Ionicons';
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userWord: '',
      errorMsg: '',
      loading: false,
      definition: null,
      showCamera: false,
      showWordList: false,
      recogonizedText: null,
    };
    console.log('App started...');
  }

  onUserWordChange(text) {
    this.setState({userWord: text});
    console.log('User Input: ', text);
  }

  async onSearch() {
    if (this.state.userWord.length <= 0) {
      this.setState({errorMsg: 'Please specify the word to lookup.'});
      return;
    }

    try {
      this.setState({loading: true});
      let lemmas = await Api.getLemmas(this.state.userWord);
      console.log('Lemmas: ', lemmas);
      if (lemmas.success) {
        let headWord = Helper.carefullyGetValue(
          lemmas,
          [
            'payload',
            'results',
            '0',
            'lexicalEntries',
            '0',
            'inflectionOf',
            '0',
            'id',
          ],
          '',
        );
        console.log('Headword is: ', headWord);
        if (headWord.length > 0) {
          let wordDefinition = await Api.getDefinition(headWord);
          if (wordDefinition.success) {
            this.setState({
              errorMsg: '',
              loading: false,
              definition: wordDefinition.payload,
            });
            console.log('Word Definition: ', wordDefinition.payload);
          } else {
            this.setState({
              errorMsg:
                'Unable to get result from Oxford: ' + wordDefinition.message,
              loading: false,
              definition: null,
            });
          }
        } else {
          this.setState({
            errorMsg: 'Invalid word. Please specify a valid word.',
            loading: false,
            definition: null,
          });
        }
      } else {
        this.setState({
          errorMsg: 'Unable to get result from Oxford: ' + lemmas.message,
          loading: false,
          definition: null,
        });
      }
    } catch (error) {
      console.log('Error: ', error);
      this.setState({
        loading: false,
        errorMsg: error.message,
        definition: null,
      });
    }
  }

  onOCRCapture(recogonizedText) {
    console.log('onCapture', recogonizedText);
    this.setState({
      showCamera: false,
      showWordList: Helper.isNotNullAndUndefined(recogonizedText),
      recogonizedText: recogonizedText,
    });
  }

  onWordSelected(word) {
    this.setState({showWordList: false, userWord: word});
    if (word.length > 0) {
      setTimeout(() => {
        this.onSearch();
      }, 500);
    }
  }
  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={[styles.column, styles.header]}>
              <Image
                style={styles.logo}
                source={require('./assets/myicon.png')}
              />
              <Text style={styles.sectionTitle}>Dictionary By Fahad</Text>
            </View>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                onChangeText={text => this.onUserWordChange(text)}
                placeholder={'Key in the word to search'}
                value={this.state.userWord}
              />
              <TouchableOpacity
                style={styles.searchCamera}
                onPress={() => {
                  this.setState({showCamera: true});
                }}>
                <Icon name="ios-camera" size={25} color="#22222288" />
              </TouchableOpacity>
            </View>

            <View style={{minHeight: 10, maxHeight: 10}}></View>

            <Button title="Search" onPress={() => this.onSearch()} />

            {this.state.errorMsg.length > 0 && (
              <Text style={styles.errMsg}>{this.state.errorMsg}</Text>
            )}

            {/* Display word definition as custom component */}
            <WordDefinition def={this.state.definition} />
          </ScrollView>
        </SafeAreaView>
        {
          // Display the camera to capture text
          this.state.showCamera && (
            <Camera
              cameraType={Constants.Type.back}
              flashMode={Constants.FlashMode.off}
              autoFocus={Constants.AutoFocus.on}
              whiteBalance={Constants.WhiteBalance.auto}
              ratio={'4:3'}
              quality={0.5}
              imageWidth={800}
              enabledOCR={true}
              onCapture={(data, recogonizedText) =>
                this.onOCRCapture(recogonizedText)
              }
              onClose={_ => {
                this.setState({showCamera: false});
              }}
            />
          )
        }
        {
          // Display the word list capture by the camera and allow user to select
          this.state.showWordList && (
            <WordSelector
              wordBlock={this.state.recogonizedText}
              onWordSelected={word => this.onWordSelected(word)}
            />
          )
        }
        {this.state.loading && (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color={'#219bd9'}
          />
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#219bd930',
    color: '#ff0000',
  },
  scrollView: {
    padding: 6,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#219bd9',
  },
  logo: {
    width: 100,
    height: 100,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  errMsg: {
    fontSize: 18,
    fontWeight: '400',
    color: 'red',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 2,
    paddingBottom: 2,
  },
  searchInput: {
    padding: 0,
    flex: 1,
  },
  // 20200502 - JustCode:
  // Camera icon style
  searchCamera: {
    maxWidth: 50,
    marginLeft: 5,
    padding: 0,
    alignSelf: 'center',
  },
});

export default App;
