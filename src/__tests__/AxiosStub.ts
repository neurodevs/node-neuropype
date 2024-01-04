import { generateId } from '@sprucelabs/test-utils'
import {
	Axios,
	AxiosDefaults,
	AxiosInterceptorManager,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios'

export default class AxiosStub implements Axios {
	public defaults = {} as AxiosDefaults

	public interceptors = {
		request: {} as AxiosInterceptorManager<InternalAxiosRequestConfig<any>>,
		response: {} as AxiosInterceptorManager<AxiosResponse<any, any>>,
	}

	public postParamsHistory: {
		url: string
		data?: any
		config?: any
	}[] = []

	public patchParamsHistory: {
		url: string
		data?: any
		config?: any
	}[] = []

	public lastDeleteParams?: {
		url: string
	}

	public deleteParamsHistory: {
		url: string
	}[] = []

	public responseToPost?: AxiosResponse<any, any>
	public lastGetUrl?: string
	public fakedGetResponse?: AxiosResponse<any, any>

	public getUri(_config?: AxiosRequestConfig<any> | undefined): string {
		return generateId()
	}

	public async request<T = any, R = AxiosResponse<T, any>, D = any>(
		_config: AxiosRequestConfig<D>
	): Promise<R> {
		return {} as R
	}

	public async get<T = any, R = AxiosResponse<T, any>, D = any>(
		url: string,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		this.lastGetUrl = url
		return (this.fakedGetResponse as R) ?? ({} as R)
	}

	public async delete<T = any, R = AxiosResponse<T, any>, D = any>(
		url: string,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		this.lastDeleteParams = {
			url,
		}

		this.deleteParamsHistory.push({
			url,
		})
		return {} as R
	}

	public async head<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async options<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async post<T = any, R = AxiosResponse<T, any>, D = any>(
		url: string,
		data?: D | undefined,
		config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		this.postParamsHistory.push({
			url,
			data,
			config,
		})
		return (this.responseToPost as R) ?? ({} as R)
	}

	public async put<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async patch<T = any, R = AxiosResponse<T, any>, D = any>(
		url: string,
		data?: D | undefined,
		config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		this.patchParamsHistory.push({
			url,
			data,
			config,
		})
		return {} as R
	}

	public async postForm<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async putForm<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async patchForm<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}
}
