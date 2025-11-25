package com.woori.wooribat.service.auth;

import java.io.IOException;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.auth.oauth2.AuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.ClientParametersAuthentication;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class GoogleOAuthService {

	@Value("${google.client.id}")
	private String clientId;

	@Value("${google.client.secret}")
	private String clientSecret;

	@Value("${google.redirect.uri}")
	private String redirectUri;

	@Value("${google.auth.uri}")
	private String authUri;

	@Value("${google.token.uri}")
	private String tokenUri;

	@Value("${google.scope}")
	private String scope;

	private static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();
	private static final JsonFactory JSON_FACTORY = new GsonFactory();

	// 구글 인증 URL 생성
	public String getAuthorizationUrl() {
		AuthorizationCodeFlow flow = new AuthorizationCodeFlow.Builder(
			BearerToken.authorizationHeaderAccessMethod(),
			HTTP_TRANSPORT,
			JSON_FACTORY,
			new GenericUrl(tokenUri),
			new ClientParametersAuthentication(clientId, clientSecret),
			clientId,
			authUri
		).setScopes(Arrays.asList(scope.split(" "))).build();

		return flow.newAuthorizationUrl().setRedirectUri(redirectUri).build();
	}

	// 액세스 토큰 발급
	public TokenResponse getAccessToken(String code) throws IOException {
		AuthorizationCodeFlow flow = new AuthorizationCodeFlow.Builder(
			BearerToken.authorizationHeaderAccessMethod(),
			HTTP_TRANSPORT,
			JSON_FACTORY,
			new GenericUrl(tokenUri),
			new ClientParametersAuthentication(clientId, clientSecret),
			clientId,
			authUri
		).setScopes(Arrays.asList(scope.split(" "))).build();

		return flow.newTokenRequest(code)
			.setRedirectUri(redirectUri)
			.execute();
	}
}
