var React = require("react");
var {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar
} = require("react-native");
var { BarCodeScanner, Permissions, AppLoading } = require("expo");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1c1d",
    justifyContent: "center",
    alignItems: "center"
  },
  cameraView: {
    flex: 1,
    width: "100%",
  },
  button: {
    height: 50,
    width: "100%",
    backgroundColor: "#00b5ad",
    margin: 5,
    padding: 7,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#00b5ad",
    justifyContent: "center",
    alignItems: "center"
  },
  textButton: {
    color: "white",
    fontWeight: "bold"
  },
});

class QrCodeScan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasCameraPermission: null
    };
    this.handleBarCodeScanned = this.handleBarCodeScanned.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }

  handleBarCodeScanned(scanResult) {
    var {data, target, type} = scanResult;
    if (type === "org.iso.QRCode" && data) {
      this.props.handleQrScanData(data);
    }
  }

  handleBack() {
    this.props.handleBack();
  }

  componentDidMount() {
    Permissions.askAsync(Permissions.CAMERA)
      .then(function(result) {
        this.setState({hasCameraPermission: result.status === "granted"});
      }.bind(this));
  }

  render() {
    if (this.state.hasCameraPermission === null) {
      return (
        <AppLoading />
      );
    }
    if (this.state.hasCameraPermission === false) {
      return null;
    }
    return (
      <View
        style={styles.container}
      >
        <StatusBar
          barStyle={"light-content"}
        />
        <BarCodeScanner
          onBarCodeScanned={this.handleBarCodeScanned}
          style={styles.cameraView}
        />
        <TouchableOpacity
          onPress={this.handleBack}
          style={styles.button}
        >
          <Text style={styles.textButton}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

module.exports = QrCodeScan;
