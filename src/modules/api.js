//import { restEndpoints, backendUrl } from '@configs/rest_config.js';
import { Requests } from './requests.js';

//const mainUrl = 'http://192.168.1.70:5004'
  const mainUrl = 'http://217.144.184.21:5004'

/**
 * Класс запросов к REST API
 * @class
 */
export class Api extends Requests {
  // /**
  //    * Авторизация пользоватедя
  //    * @param login - логин пользователя
  //    * @param password - пароль пользователя
  //    * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} -
  //    * результат запроса и статус
  //    */
  // async login(login, password) {
  //   const endpoint = restEndpoints.login;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method, { login, password });
  // }
  //
  // /**
  //    * Проверяет, авторизован ли пользователь.
  //    * Используется при первом заходе на страницу, чтобы проверить, жива ли кука с сессией.
  //    * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} -
  //    * результат запроса и статус
  //    */
  // async isAuth() {
  //   const endpoint = restEndpoints.checkAuth;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method);
  // }
  //
  // /**
  //  * Разлогинивает пользователя
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>}
  //  */
  // async logout() {
  //   const endpoint = restEndpoints.logout;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method);
  // }
  //
  // /**
  //  * Получить все автомобили
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async getCars() {
  //   const endpoint = restEndpoints.getCars;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method);
  // }
  //
  // /**
  //  * Получить все рейсы
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async getShipments() {
  //   const endpoint = restEndpoints.getShipments;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method);
  // }
  //
  // /**
  //  * Добавить груз
  //  * @param cargo_id - сгенерированный uuid груза
  //  * @param shipment_id - id рейса
  //  * @param cargo_amount - количество груза
  //  * @param cargo_volume - объём 1 единицы груза
  //  * @param cargo_name - имя груза
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async addCargo(cargo_id, shipment_id, cargo_amount, cargo_volume, cargo_name) {
  //   const endpoint = restEndpoints.addCargo;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method, {cargo_id, shipment_id, cargo_amount, cargo_volume, cargo_name});
  // }
  //
  // /**
  //  * Добавить рейс
  //  * @param shipment_id - сгенерированный uuid рейса
  //  * @param shipment_destination - пункт назначения рейса
  //  * @param shipment_car - номер автомобиля рейса
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async addShipment(shipment_id, shipment_destination, shipment_car) {
  //   const endpoint = restEndpoints.addShipment;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method, {shipment_id, shipment_destination, shipment_car});
  // }
  //
  // /**
  //  * Удаление груза
  //  * @param cargo_id - id груза
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async removeCargo(cargo_id) {
  //   const endpoint = restEndpoints.removeCargo;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method, {cargo_id});
  // }
  //
  // /**
  //  * Удаление рейса
  //  * @param shipment_id - id рейса
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async removeShipment(shipment_id) {
  //   const endpoint = restEndpoints.removeShipment;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method, {shipment_id});
  // }
  //
  // /**
  //  * Редактирование рейса
  //  * @param shipment_id - id рейса
  //  * @param shipment_destination - новый пункт назначений рейса
  //  * @param shipment_car - новый номер машины рейса
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async updateShipment(shipment_id, shipment_destination, shipment_car) {
  //   const endpoint = restEndpoints.updateShipment;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method, {shipment_id, shipment_destination, shipment_car});
  // }
  //
  // /**
  //  * Редактирование груза
  //  * @param cargo_id - id груза
  //  * @param cargo_amount - новое количество груза
  //  * @param cargo_volume - новый объём 1 единицы груза
  //  * @param cargo_name - новое имя груза
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async updateCargo(cargo_id, cargo_amount, cargo_volume, cargo_name) {
  //   const endpoint = restEndpoints.updateCargo;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method, {cargo_id, cargo_amount, cargo_volume, cargo_name});
  // }
  //
  // /**
  //  * Перенос груза
  //  * @param cargo_id - id груза
  //  * @param new_shipment_id - id нового рейса
  //  * @param old_shipment_id - id старого рейса
  //  * @param cargo_amount - количество груза
  //  * @param cargo_volume - объём 1 единицы груза
  //  * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
  //  */
  // async moveCargo(cargo_id, new_shipment_id, old_shipment_id, cargo_amount, cargo_volume) {
  //   const endpoint = restEndpoints.moveCargo;
  //   const url = backendUrl + endpoint.url;
  //   return this.make_request(url, endpoint.method, {cargo_id, new_shipment_id, old_shipment_id, cargo_amount, cargo_volume});
  // }

  /**
   * compile
   * @returns {Promise<{data: *, status: number}|{data: null, status: number}>} - результат запроса и статус
   */
  async compile(code, fname, kernelId) {
    //const endpoint = restEndpoints.getDestination;
    const url = mainUrl + '/uzbek';
    return this.make_request(url, 'POST', {filename: fname, code: code, kernelId: kernelId});
  }

  async getCode(filename) {
    //const endpoint = restEndpoints.getDestination;
    const url = mainUrl + '/getcode';
    return this.make_request(url, 'POST', {body: filename} );
  }
  async getDirs(parent) {
    //const endpoint = restEndpoints.getDestination;
    const url = mainUrl + '/dirs';
    return this.make_request(url, 'POST', {parent} );
  }

  async getBlocks(parent) {
    //const endpoint = restEndpoints.getDestination;
    const url = mainUrl + '/blocks';
    return this.make_request(url, 'POST', {parent} );
  }

  async getFileBlocks(path) {
    const url = mainUrl + '/blocks';
    return this.make_request(url, 'POST', {path} );
  }

  async startKernel(id) {
    const url = mainUrl + '/kernel'
    return this.make_request(url, 'POST', {id} );
  }

  async stopKernel(id) {
    const url = mainUrl + '/kernelstop'
    return this.make_request(url, 'POST', {id} );
  }

  async addBlock(id, order, block, lorder) {
    const url = mainUrl + '/addblock'
    return this.make_request(url, 'POST', {"kernelId": id, "newOrder": order, "newBlocks": [block], "newLangs" : lorder} );
  }
  async addFile(id, path, name) {
    const url = mainUrl + '/addfile'
    return this.make_request(url, 'POST', {"parentId": id, "name": name, "path": path} );
  }

  async auth(login, password) {
    const url = mainUrl + '/login'
    return this.make_request(url, 'POST', {"login": login, "password": password} );
  }

  async isAuth() {
    const url = mainUrl + '/isauth'
    return this.make_request(url, 'GET');
  }
}
