var React = require("react");
var passwordValidator = require('password-validator');
var {
  StyleSheet,
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StatusBar
} = require("react-native");

var QrCodeScan = require("./QrCodeScan");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#1b1c1d",
    justifyContent: "center",
    alignItems: "center"
  },
  viewContainer: {
    height: 425,
    width: "90%",
    justifyContent: "center",
    alignItems: "center"
  },
  textInputContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContainer: {
    height: 100,
    width: 350,
    justifyContent: "center",
    alignItems: "center"
  },
  notificationBoxContainer: {
    height: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffe8e6",
    borderRadius: 5
  },
  textTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    margin: 5
  },
  textButton: {
    color: "white",
    fontWeight: "bold"
  },
  textInput: {
    flex: 1,
    width: "100%",
    margin: 5,
    padding: 7,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 5,
    color: "white"
  },
  textNotification: {
    color: "#db2828",
    fontWeight: "bold"
  },
  button: {
    flex: 1,
    width: "100%",
    margin: 5,
    padding: 7,
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  }
});

var validateUsernameFormat= function(username) {
  var schema = new passwordValidator();
  schema
    .is().min(1)
    .is().max(64)
    .has().not().spaces();
  return schema.validate(username);
};

var validatePasswordFormat = function(password) {
  var schema = new passwordValidator();
  schema
    .is().min(1)
    .is().max(64)
    .has().not().spaces();
  return schema.validate(password);
};

var validateResetPasswordFormat = function(password) {
  var schema = new passwordValidator();
  schema
    .is().min(8)
    .is().max(64)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces();
  return schema.validate(password);
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      username: "",
      validUsername: false,
      password: "",
      retypePassword: "",
      validPassword: false,
      passwordMatch: false,
      initialToken: null,
      validInitialToken: null,
      passwordResetSuccess: false,
      invalidLogin: false,
      loading: false,
      qrCodeScan: false
    };
    this.inputs = {};
    this.resetState = this.resetState.bind(this);
    this.focusNextField = this.focusNextField.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleRetypePassword = this.handleRetypePassword.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleResetPassword = this.handleResetPassword.bind(this);
    this.handleQrCodeScan = this.handleQrCodeScan.bind(this);
    this.handleQrScanData = this.handleQrScanData.bind(this);
    this.handleQrScanError = this.handleQrScanError.bind(this);
  }

  focusNextField(id) {
    this.inputs[id].focus();
  }

  handleBack() {
    this.setState({qrCodeScan: false});
  }

  resetState() {
    this.setState({
      username: "",
      validUsername: false,
      password: "",
      validPassword: false,
      retypePassword: "",
      passwordMatch: false,
      initialToken: null,
      validInitialToken: null,
      passwordResetSuccess: false,
      invalidLogin: false,
      loading: false,
      qrCodeScan: false
    });
  }

  handleUsername(e) {
    this.setState({
      username: e,
      validUsername: validateUsernameFormat(e)
    });
  }

  handlePassword(e) {
    if (this.state.validInitialToken !== true) {
      this.setState({
        password: e,
        validPassword: validatePasswordFormat(e),
        passwordMatch: e === this.state.reTypePassword
      });
    }
    else {
      this.setState({
        password: e,
        validPassword: validateResetPasswordFormat(e),
        passwordMatch: e === this.state.reTypePassword
      });
    }
  }

  handleRetypePassword(e) {
    if (this.state.validInitialToken === true) {
      this.setState({
        retypePassword: e,
        validPassword: validateResetPasswordFormat(e),
        passwordMatch: e === this.state.password
      });
    }
  }

  handleLogin() {
    if (this.state.validUsername && this.state.validPassword) {
      Keyboard.dismiss();
      this.props.login({
        username: this.state.username,
        password: this.state.password
      });
      this.setState({
        password: "",
        validPassword: false,
        retypePassword: "",
        passwordMatch: false,
        initialToken: null,
        validInitialToken: null,
        passwordResetSuccess: false,
        invalidLogin: false,
        loading: true
      });
    }
  }

  handleResetPassword() {
    if (this.state.validInitialToken && this.state.validUsername && this.state.validPassword && this.state.passwordMatch) {
      this.props.resetPassword({
        initialToken: this.state.initialToken,
        username: this.state.username,
        password: this.state.password
      });
      this.setState({
        password: "",
        validPassword: false,
        retypePassword: "",
        passwordMatch: false,
        initialToken: null,
        validInitialToken: null,
        passwordResetSuccess: false,
        invalidLogin: false,
        loading: true
      });
    }
  }

  handleQrCodeScan() {
    this.setState({
      qrCodeScan: true
    });
  }

  handleQrScanData(initialToken) {
    if (initialToken) {
      this.props.onboard({initialToken: initialToken});
      this.setState({
        initialToken: initialToken,
        loading: true,
        qrCodeScan: false
      });
    }
  }

  handleQrScanError(err) {
    if (err) {
      this.setState({
        validInitialToken: false
      });
    }
  }

  componentDidUpdate() {
    var user = this.props.user;
    if (this.state.initialToken) {
      if (!this.state.validInitialToken && user.authenticated === null && user.user) {
        if (user.user.passwordResetRequired) {
          this.setState({
            username: user.user.username,
            validUsername: true,
            validInitialToken: true,
            loading: false
          });
        }
      }
    }
    if (user.authenticated === null && user.user) {
      if (!this.state.passwordResetSuccess && !user.user.passwordResetRequired) {
        this.setState({
          passwordResetSuccess: true,
          username: user.user.username,
          loading: false
        });
      }
    }
    if (!this.state.invalidLogin && user.authenticated === false) {
      this.setState({
        invalidLogin: true,
        loading: false,
      });
    }
    if (this.state.invalidLogin && user.authenticated === null) {
      this.setState({
        invalidLogin: false,
      });
    }
  }

  componentWillUnmount() {
    this.resetState();
  }

  render() {
    if (this.state.qrCodeScan) {
      return (
        <QrCodeScan
          handleBack={this.handleBack}
          handleQrScanData={this.handleQrScanData}
        />
      );
    }
    return (
      <KeyboardAvoidingView
        style={styles.container}
      >
        <StatusBar
          barStyle="light-content"
        />
        <View
          style={styles.container}
        >
          {
            this.state.validInitialToken === true
              ?
                (
                  <View
                    style={styles.viewContainer}
                  >
                    <Image
                      style={{width: "25%"}}
                      source={require("../assets/cryptobank-logo.png")}
                      resizeMode="contain"
                    />
                    <Text
                      style={styles.textTitle}
                    >Set Your Account Password</Text>
                    <View
                      style={styles.textInputContainer}
                    >
                      <TextInput
                        onChangeText={this.handleUsername}
                        value={this.state.username}
                        style={styles.textInput}
                        autoCorrect={false}
                        clearButtonMode="always"
                        placeholder="Username"
                        placeholderTextColor="#696969"
                        autoCapitalize = "none"
                        blurOnSubmit={false}
                        onSubmitEditing={() => {this.focusNextField('password')}}
                        ref={(input) => {this.inputs['username'] = input}}
                        returnKeyType="next"
                      />
                      <TextInput
                        onChangeText={this.handlePassword}
                        value={this.state.password}
                        style={styles.textInput}
                        autoCorrect={false}
                        clearButtonMode="always"
                        placeholder="Password"
                        placeholderTextColor="#696969"
                        autoCapitalize = "none"
                        secureTextEntry={true}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {this.focusNextField('retypePassword')}}
                        ref={(input) => {this.inputs['password'] = input}}
                        returnKeyType="next"
                      />
                      <TextInput
                        onChangeText={this.handleRetypePassword}
                        value={this.state.retypePassword}
                        style={styles.textInput}
                        autoCorrect={false}
                        clearButtonMode="always"
                        placeholder="Retype Password"
                        placeholderTextColor="#696969"
                        autoCapitalize = "none"
                        secureTextEntry={true}
                        blurOnSubmit={true}
                        ref={(input) => {this.inputs['retypePassword'] = input}}
                        returnKeyType="done"
                      />
                      <TouchableOpacity
                        onPress={this.handleResetPassword}
                        disabled={!(this.state.validInitialToken && this.state.validUsername && this.state.validPassword && this.state.passwordMatch)}
                        style={[styles.button, {borderColor: "#2185d0", backgroundColor: "#2185d0"}]}
                      >
                        <Text
                          style={styles.textButton}
                        >Set Password
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              :
                (
                  <View
                    style={styles.viewContainer}
                  >
                    <Image
                      style={{width: "25%"}}
                      source={require("../assets/cryptobank-logo.png")}
                      resizeMode="contain"
                    />
                    <Text
                      style={styles.textTitle}
                    >Account Login</Text>
                    <View
                      style={styles.textInputContainer}
                    >
                      <TextInput
                        onChangeText={this.handleUsername}
                        value={this.state.username}
                        style={styles.textInput}
                        autoCorrect={false}
                        clearButtonMode="always"
                        placeholder="Username"
                        placeholderTextColor="#696969"
                        autoCapitalize = "none"
                        blurOnSubmit={false}
                        onSubmitEditing={() => {this.focusNextField('password')}}
                        ref={(input) => {this.inputs['username'] = input}}
                        returnKeyType="next"
                      />
                      <TextInput
                        onChangeText={this.handlePassword}
                        value={this.state.password}
                        style={styles.textInput}
                        autoCorrect={false}
                        clearButtonMode="always"
                        placeholder="Password"
                        placeholderTextColor="#696969"
                        autoCapitalize = "none"
                        secureTextEntry={true}
                        blurOnSubmit={true}
                        ref={(input) => {this.inputs['password'] = input}}
                        returnKeyType="done"
                      />
                      <TouchableOpacity
                        onPress={this.handleLogin}
                        disabled={!this.state.validUsername || !this.state.validPassword}
                        style={[styles.button, {borderColor: "#2185d0", backgroundColor: "#2185d0"}]}
                      >
                        <Text
                          style={styles.textButton}
                        >Login
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={this.handleQrCodeScan}
                        style={[styles.button, {backgroundColor: "#00b5ad", borderColor: "#00b5ad"}]}
                      >
                        <Text
                          style={styles.textButton}
                        >First Time?  Show QR Code
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
          }
          <View
            style={styles.notificationContainer}
          >
            {
              this.state.loading
                ? <ActivityIndicator size="large" />
                : null
            }
            {
              this.state.passwordResetSuccess
                ?
                  (
                    <View style={styles.notificationBoxContainer}>
                      <Text style={styles.textNotification}>
                        Password Successfully Reset.
                      </Text>
                      <Text style={styles.textNotification}>
                        You can now Login!
                      </Text>
                    </View>
                  )
                : null
            }
            {
              this.state.invalidLogin
                ?
                  (
                    <View style={styles.notificationBoxContainer}>
                      <Text style={styles.textNotification}>Invalid Credentials!</Text>
                    </View>
                  )
                : null
            }
            {
             this.state.validInitialToken && this.state.password && !this.state.validPassword
               ?
                 (
                   <View style={styles.notificationBoxContainer}>
                    <Text style={styles.textNotification}>
                      Password must contain at least 8
                    </Text>
                    <Text style={styles.textNotification}>
                      characters with uppercase letters and digits
                    </Text>
                   </View>
                 )
               : null
            }
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

module.exports = Login;
