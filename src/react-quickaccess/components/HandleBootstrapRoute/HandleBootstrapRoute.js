/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
import React from "react";
import PropTypes from "prop-types";
import { BOOTSTRAP_FEATURE } from "../../ExtQuickAccess";
import { withActiveSessionLocalStorage } from "../../../shared/context/ActiveSession/ActiveSessionLocalStorageContext";
import UserActiveSessionEntity from "../../../shared/models/entity/session/userActiveSessionEntity";
import { withRouter, Redirect } from "react-router-dom";
import { withAppContext } from "../../../shared/context/AppContext/AppContext";

/**
 * This component takes care of redirect the user.
 */
class HandleBootstrapRoute extends React.Component {
  /**
   * Get the route to quickaccess should bootstrap on.
   * @returns {string}
   */
  getBootstrapRoute() {
    const activeSession = this.props.activeSession || this.props.activeSessionLocalStorageContext?.get();
    if (!activeSession) {
      return "/webAccessibleResources/quickaccess/login";
    }
    /*
     * If the user is already authenticated (online or offline), keep them in the app.
     * Losing server reachability should not kick an authenticated user out or block them
     * with an unreachable server screen.
     */
    if (activeSession.isAuthenticated) {
      return this.getOnlineAuthenticatedRoute();
    }

    /*
     * If the server is not reachable, seamlessly route to the offline login page when an
     * account is configured or available, instead of blocking on the server unavailable screen.
     */
    if (!activeSession.isServerReachable) {
      const account = this.props.account || this.props.context?.account;
      const canUseOfflineMode = this.props.context?.canUseOfflineMode;
      if (account || canUseOfflineMode) {
        return "/webAccessibleResources/quickaccess/login-offline";
      }
      return "/webAccessibleResources/quickaccess/server-not-reachable";
    }

    // Server reachable but user not authenticated: online login page.
    return "/webAccessibleResources/quickaccess/login";
  }

  /**
   * Get the route for an online authenticated user, based on the requested bootstrap feature.
   * @returns {string}
   */
  getOnlineAuthenticatedRoute() {
    switch (this.props.bootstrapFeature) {
      case BOOTSTRAP_FEATURE.CREATE_NEW_CREDENTIALS:
      case BOOTSTRAP_FEATURE.SAVE_CREDENTIALS:
        return "/webAccessibleResources/quickaccess/resources/create";
      case BOOTSTRAP_FEATURE.AUTOSAVE_CREDENTIALS:
        return "/webAccessibleResources/quickaccess/resources/autosave";
    }

    return "/webAccessibleResources/quickaccess/home";
  }

  /**
   * Renders the component
   * @returns {JSX.Element}
   */
  render() {
    const route = this.getBootstrapRoute();
    if (this.props.history?.push) {
      this.props.history.push(route);
    }
    return <Redirect to={route} />;
  }
}

HandleBootstrapRoute.propTypes = {
  context: PropTypes.any, // The application context
  activeSession: PropTypes.instanceOf(UserActiveSessionEntity), // The user active session
  history: PropTypes.object, // The history
  bootstrapFeature: PropTypes.string, // The bootstrap feature
};

export default withRouter(withAppContext(withActiveSessionLocalStorage(HandleBootstrapRoute)));
