package io.ssafy.p.k7a504.ore.user.service.impl;

import io.ssafy.p.k7a504.ore.common.exception.CustomException;
import io.ssafy.p.k7a504.ore.common.exception.ErrorCode;
import io.ssafy.p.k7a504.ore.common.security.SecurityUtil;
import io.ssafy.p.k7a504.ore.jwt.TokenDto;
import io.ssafy.p.k7a504.ore.jwt.TokenProvider;
import io.ssafy.p.k7a504.ore.user.domain.User;
import io.ssafy.p.k7a504.ore.user.dto.UserInfoRequestDto;
import io.ssafy.p.k7a504.ore.user.dto.UserPasswordRequestDto;
import io.ssafy.p.k7a504.ore.user.dto.UserEmailVerificationRequestDto;
import io.ssafy.p.k7a504.ore.user.dto.UserSignInRequestDto;
import io.ssafy.p.k7a504.ore.user.dto.UserSignUpRequestDto;
import io.ssafy.p.k7a504.ore.user.repository.UserRepository;
import io.ssafy.p.k7a504.ore.user.service.EmailService;
import io.ssafy.p.k7a504.ore.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder encoder;
    private final TokenProvider tokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    @Override
    public void sendCertificationEmail(String email) {
        if(userRepository.existsByEmail(email))
            throw new CustomException(ErrorCode.DUPLICATE_USER_EMAIL);
        emailService.sendCertificationMail(email);
    }

    @Override
    public boolean verifyEmail(UserEmailVerificationRequestDto emailVerificationRequestDto) {
        return emailService.verifyEmail(emailVerificationRequestDto);
    }

    @Transactional
    @Override
    public String signUp(UserSignUpRequestDto userSignUpRequestDto) {
        if(userRepository.existsByEmail(userSignUpRequestDto.getEmail()))
            throw new CustomException(ErrorCode.DUPLICATE_USER_EMAIL);

        return userRepository.save(userSignUpRequestDto.toEntityWithOwner(encoder)).getEmail();
    }

    @Override
    public TokenDto signIn(UserSignInRequestDto userSignInRequestDto) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(userSignInRequestDto.getEmail(), userSignInRequestDto.getPassword());
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        return new TokenDto(tokenProvider.createToken(authentication));
    }

    @Override
    @Transactional
    public void findUserPassword(UserInfoRequestDto userInfoRequestDto) {
        User user = userRepository.findByEmailAndName(userInfoRequestDto.getEmail(), userInfoRequestDto.getName())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        String tempPassword = generateTempPassword();

        user.changePassword(encoder.encode(tempPassword));
        emailService.sendTempPasswordMail(user.getEmail(), tempPassword);
    }

    @Override
    @Transactional
    public Long changeUserPassword(UserPasswordRequestDto userPasswordRequestDto) {
        User user = userRepository.findById(SecurityUtil.getCurrentUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.changePassword(encoder.encode(userPasswordRequestDto.getPassword()));
        return user.getId();
    }

    private String generateTempPassword() {
        char[] charSet = new char[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
                'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' };

        String tempPassword = "";

        int idx = 0;
        for (int i = 0; i < 10; i++) {
            idx = (int) (charSet.length * Math.random());
            tempPassword += charSet[idx];
        }
        return tempPassword;
    }
}
