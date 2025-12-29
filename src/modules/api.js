//import { restEndpoints, backendUrl } from '@configs/rest_config.js';
import { Requests } from './requests.js';

const mainUrl = 'http://127.0.0.1:20596/api/v1'
 // const mainUrl = 'http://217.144.184.21:5004'

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


  async getCode(filename) {
    //const endpoint = restEndpoints.getDestination;
    const url = mainUrl + '/fm/getcode';
    return this.make_request(url, 'POST', {body: filename} );
  }
  async getDirs(parent) {
    //const endpoint = restEndpoints.getDestination;
    const url = mainUrl + '/fm/dirs/' + parent;
    return this.make_request(url, 'GET',);
  }

  async getBlocks(parent) {
    //const endpoint = restEndpoints.getDestination;
    const url = mainUrl + '/fm/files/' + parent;
    return this.make_request(url, 'GET');
  }

  async getFileBlocks(path) {
    const url = mainUrl + '/fm/files' + path;
    return this.make_request(url, 'GET');
  }

  async startKernel(id) {
    const url = mainUrl + '/fm/kernel'
    return this.make_request(url, 'POST', {id} );
  }

  async stopKernel(id) {
    const url = mainUrl + '/fm/kernelstop'
    return this.make_request(url, 'POST', {id} );
  }


  async addFile(parent_id, name, is_dir) {
    if (parent_id === "mainlist") {
      parent_id = "00000000-0000-0000-0000-000000000000"
    }
    const url = mainUrl + '/fm/tree/'
    return this.make_request(url, 'PUT', {"is_dir": is_dir, "parent_dir": parent_id, "name": name} );
  }
  
  async moveFile(id, parent_id) {
    const url = mainUrl + '/fm/files/move/' + id
    return this.make_request(url, 'PATCH', {"parent_dir": parent_id} );
  }


  async addBlock(id, prev_id, language) {
    const url = mainUrl + '/fm/block/' + id;
    return this.make_request(url, 'POST', {"prev_id": prev_id, "language" : language} );
  }
  async moveBlock(id, neighbor, direction, file) {
    const url = mainUrl + '/fm/block/' + file + '/' + id + '?neighbor=' + neighbor + '&dir=' + direction;
    return this.make_request(url, 'PATCH');
  }
  async deleteBlock(id) {
    const url = mainUrl + '/fm/block/' + id
    return this.make_request(url, 'DELETE');
  }
  

  async renameFile(id, name) {
    const url = mainUrl + '/fm/tree/rename/' + id
    return this.make_request(url, 'PATCH', {"name": name} );
  }
  

  async deleteFile(id) {
    const url = mainUrl + '/fm/files/' + id
    return this.make_request(url, 'DELETE');
  }

  async auth(login, password) {
    const url = mainUrl + '/fm/login'
    return this.make_request(url, 'POST', {"login": login, "password": password} );
  }

  async self() {
    const url = mainUrl + '/iam/user/self'
    return this.make_request(url, 'GET');
  }
  async getSessions() {
    const url = mainUrl + '/iam/session'
    return this.make_request(url, 'GET');
  }
  async revokeSession(sessionId) {
    const url = mainUrl + '/iam/session/' + sessionId
    return this.make_request(url, 'DELETE');
  }
}
