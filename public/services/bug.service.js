import { sortBy } from "lodash"

export const bugService = {
  query, 
  save,
  remove,
  getById,
  getDefaultFilter,
}

let pageIdx = 0;
const BASE_URL = '/api/bug/'

function query(filterBy = { txt: '', severity: 0, sortBy: { type: 'title', desc: 1 }, pageIdx: 0 }) {
  return axios.get(BASE_URL, { params: filterBy }).then(res => res.data)
}

function getById(carId) {
  return axios.get(BASE_URL + carId).then(res => res.data)
}
function remove(carId) {
  return axios.delete(BASE_URL + carId)
}
function save(car) {
  if (car._id) {
    return axios.put(BASE_URL + car._id, car).then(res => res.data)
  } else {
    return axios.post(BASE_URL, car).then(res => res.data)
  }
}
function getDefaultFilter() {
  return { txt: '', Severity: '', labels: '', pageIdx: 0, sortBy: {type: 'title', desc: 1}}
}
