package com.example.onfit.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemberMapper {
    void updatePersonalColor(@Param("id") Long id, @Param("personalColor") String personalColor);
}