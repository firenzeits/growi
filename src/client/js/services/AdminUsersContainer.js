import { Container } from 'unstated';

import loggerFactory from '@alias/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminUserGroupDetailContainer');

/**
 * Service container for admin users page (Users.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminUsersContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;

    this.state = {
      users: [],
      isPasswordResetModalShown: false,
      isUserInviteModalShown: false,
      userForPasswordResetModal: null,
      totalUsers: 0,
      activePage: 1,
      pagingLimit: Infinity,
      selectedStatusList: new Set(),
      searchText: '',
    };

    this.showPasswordResetModal = this.showPasswordResetModal.bind(this);
    this.hidePasswordResetModal = this.hidePasswordResetModal.bind(this);
    this.toggleUserInviteModal = this.toggleUserInviteModal.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminUsersContainer';
  }

  isSelected(statusType) {
    return this.state.selectedStatusList.has(statusType);
  }

  handleClick(statusType) {
    if (this.isSelected(statusType)) {
      this.deleteStatusFromList(statusType);
    }
    else {
      this.addStatusToList(statusType);
    }
  }

  addStatusToList(statusType) {
    const { selectedStatusList } = this.state;
    selectedStatusList.add(statusType);
    this.setState({ selectedStatusList });
  }

  deleteStatusFromList(statusType) {
    const { selectedStatusList } = this.state;
    selectedStatusList.delete(statusType);
    this.setState({ selectedStatusList });
  }

  getSearchText() {
    return this.state.searchText;
  }

  handleChange(searchText) {
    this.setState({ searchText });
  }

  /**
   * syncUsers of selectedPage
   * @memberOf AdminUsersContainer
   * @param {number} selectedPage
   */
  async retrieveUsersByPagingNum(selectedPage) {

    const params = { page: selectedPage };
    const { data } = await this.appContainer.apiv3.get('/users', params);

    if (data.paginateResult == null) {
      throw new Error('data must conclude \'paginateResult\' property.');
    }

    const { docs: users, totalDocs: totalUsers, limit: pagingLimit } = data.paginateResult;

    this.setState({
      users,
      totalUsers,
      pagingLimit,
      activePage: selectedPage,
    });

  }

  /**
   * create user invited
   * @memberOf AdminUsersContainer
   * @param {object} shapedEmailList
   * @param {bool} sendEmail
   */
  async createUserInvited(shapedEmailList, sendEmail) {
    const response = await this.appContainer.apiv3.post('/users/invite', {
      shapedEmailList,
      sendEmail,
    });
    await this.retrieveUsersByPagingNum(this.state.activePage);
    const { invitedUserList } = response.data;
    return invitedUserList;
  }

  /**
   * open reset password modal, and props user
   * @memberOf AdminUsersContainer
   * @param {object} user
   */
  async showPasswordResetModal(user) {
    await this.setState({
      isPasswordResetModalShown: true,
      userForPasswordResetModal: user,
    });
  }

  /**
   * close reset password modal
   * @memberOf AdminUsersContainer
   */
  async hidePasswordResetModal() {
    await this.setState({ isPasswordResetModalShown: false });
  }

  /**
   * toggle user invite modal
   * @memberOf AdminUsersContainer
   */
  async toggleUserInviteModal() {
    await this.setState({ isUserInviteModalShown: !this.state.isUserInviteModalShown });
  }

  /**
   * Give user admin
   * @memberOf AdminUsersContainer
   * @param {string} userId
   * @return {string} username
   */
  async giveUserAdmin(userId) {
    const response = await this.appContainer.apiv3.put(`/users/${userId}/giveAdmin`);
    const { username } = response.data.userData;
    await this.retrieveUsersByPagingNum(this.state.activePage);
    return username;
  }

  /**
   * Remove user admin
   * @memberOf AdminUsersContainer
   * @param {string} userId
   * @return {string} username
   */
  async removeUserAdmin(userId) {
    const response = await this.appContainer.apiv3.put(`/users/${userId}/removeAdmin`);
    const { username } = response.data.userData;
    await this.retrieveUsersByPagingNum(this.state.activePage);
    return username;
  }

  /**
   * Activate user
   * @memberOf AdminUsersContainer
   * @param {string} userId
   * @return {string} username
   */
  async activateUser(userId) {
    const response = await this.appContainer.apiv3.put(`/users/${userId}/activate`);
    const { username } = response.data.userData;
    await this.retrieveUsersByPagingNum(this.state.activePage);
    return username;
  }

  /**
   * Deactivate user
   * @memberOf AdminUsersContainer
   * @param {string} userId
   * @return {string} username
   */
  async deactivateUser(userId) {
    const response = await this.appContainer.apiv3.put(`/users/${userId}/deactivate`);
    const { username } = response.data.userData;
    await this.retrieveUsersByPagingNum(this.state.activePage);
    return username;
  }

  /**
   * remove user
   * @memberOf AdminUsersContainer
   * @param {string} userId
   * @return {object} removedUserData
   */
  async removeUser(userId) {
    const response = await this.appContainer.apiv3.delete(`/users/${userId}/remove`);
    const removedUserData = response.data.userData;
    await this.retrieveUsersByPagingNum(this.state.activePage);
    return removedUserData;
  }

}
